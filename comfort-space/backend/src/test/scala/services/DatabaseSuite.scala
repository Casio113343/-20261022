package services

import cats.effect.{IO, Resource, Deferred}
import cats.syntax.all.*
import java.util.UUID
import java.nio.file.{Files, Paths}
import io.circe.parser.decode
import munit.CatsEffectSuite
import services.system.database.{Database, Schema}
import services.system.api.{ApiError, ApiEndpoint}
import services.identity.api.*
import services.identity.tables.SessionTable.SessionTable
import services.conversations.api.*
import services.collection.api.SetFavouriteMessage
import services.journal.api.AddMoodMessage
import services.journal.objects.Mood
import services.journal.tables.MoodTable.MoodTable
import services.identity.objects.Preferences
import services.conversations.routes.ConversationsRoutes
import services.identity.routes.IdentityRoutes
import services.journal.routes.JournalRoutes
import services.collection.routes.CollectionRoutes
import org.http4s.{Request, Method, Uri, Header, Status}
import org.http4s.circe.*
import org.typelevel.ci.CIString
import io.circe.Json
import services.system.api.APIMessageRouter
import org.http4s.server.middleware.EntityLimiter

class DatabaseSuite extends CatsEffectSuite:
  test("超大请求明确返回 413，不伪装成服务器内部失败") {
    withDatabase { db =>
      Resource
        .make(db.transact(StartSessionMessage().plan))(session =>
          db.transact(connection => SessionTable.delete(connection, session.ownerId))
        )
        .use { session =>
          val endpoints = IdentityRoutes.apiMessages ++ ConversationsRoutes.apiMessages(
            3
          ) ++ JournalRoutes.apiMessages ++ CollectionRoutes.apiMessages
          val app = EntityLimiter
            .httpApp[IO](APIMessageRouter.routes(db, endpoints, Set.empty).orNotFound, 32768L)
          val request = Request[IO](Method.POST, Uri.unsafeFromString("/api/sendmessage"))
            .withEntity(Json.obj("content" -> Json.fromString("x" * 40000)))
            .putHeaders(Header.Raw(CIString("Cookie"), s"qiyu_session=${session.token}"))
          app
            .run(request)
            .flatMap(response => IO(assertEquals(response.status, Status.PayloadTooLarge)))
            .flatMap(_ => app.run(request.withUri(Uri.unsafeFromString("/api/startsession"))))
            .map(response => assertEquals(response.status, Status.PayloadTooLarge))
        }
    }
  }
  private def withDatabase[A](use: Database => IO[A]): IO[A] = IO.delay(sys.env).flatMap { env =>
    IO.fromOption(env.get("QIYU_DB_PASSWORD"))(
      new IllegalStateException("Database tests require QIYU_DB_PASSWORD")
    ).flatMap { password =>
      Database
        .resource(
          env.getOrElse("QIYU_DB_URL", "jdbc:postgresql://127.0.0.1:55432/qiyu"),
          env.getOrElse("QIYU_DB_USER", "qiyu"),
          password
        )
        .evalTap(_.transact(Schema.initialize))
        .use(use)
    }
  }
  private def withOwner[A](db: Database)(use: UUID => IO[A]): IO[A] =
    Resource
      .make(db.transact(StartSessionMessage().plan))(session =>
        db.transact(connection => SessionTable.delete(connection, session.ownerId))
      )
      .use(session => use(session.ownerId))

  test("并发重试同一请求只追加一轮，冲突正文明确失败") {
    withDatabase(db =>
      withOwner(db) { owner =>
        val id = UUID.randomUUID()
        val requestId = UUID.randomUUID()
        db.transact(CreateConversationMessage(owner, id).plan)
          .flatMap(_ =>
            List
              .fill(8)(db.transact(SendMessageMessage(owner, id, requestId, "考试成绩让我失落", 3).plan))
              .parSequence
          )
          .flatMap { replies =>
            assert(replies.forall(_.messages.size == 2))
            db.transact(SendMessageMessage(owner, id, requestId, "换了另一条消息", 3).plan).attempt
          }
          .flatMap { conflict =>
            assert(conflict.left.exists {
              case error: ApiError => error.status == 409; case _ => false
            })
            db.transact(GetConversationMessage(owner, id).plan)
              .map(result => assertEquals(result.messages.size, 2))
          }
      }
    )
  }
  test("其他访客不能读取、发送或删除会话") {
    withDatabase(db =>
      withOwner(db)(owner =>
        withOwner(db) { stranger =>
          val id = UUID.randomUUID()
          db.transact(CreateConversationMessage(owner, id).plan)
            .flatMap(_ =>
              Vector(
                db.transact(GetConversationMessage(stranger, id).plan).void,
                db.transact(DeleteConversationMessage(stranger, id).plan).void,
                db.transact(SendMessageMessage(stranger, id, UUID.randomUUID(), "越权测试", 3).plan)
                  .void
              ).traverse(_.attempt)
            )
            .flatMap { attempts =>
              assert(attempts.forall(_.left.exists {
                case error: ApiError => error.status == 404; case _ => false
              }))
              db.transact(GetConversationMessage(owner, id).plan)
                .map(value => assertEquals(value.messages.size, 0))
            }
        }
      )
    )
  }
  test("多步写事务失败回滚，不留下部分写入") {
    withDatabase(db =>
      withOwner(db) { owner =>
        val id = UUID.randomUUID()
        val mood = Mood(id.toString, "平静", "合成事务测试", "now")
        db.transact(connection =>
          MoodTable
            .insert(connection, owner, mood)
            .flatMap(_ => IO.raiseError[Unit](new RuntimeException("synthetic failure")))
        ).attempt
          .flatMap(_ => db.transact(connection => MoodTable.find(connection, owner, id)))
          .map(value => assertEquals(value, None))
      }
    )
  }
  test("收藏、手记、偏好可恢复，清空事务删除关联请求与内容") {
    withDatabase(db =>
      withOwner(db) { owner =>
        val id = UUID.randomUUID()
        db.transact(CreateConversationMessage(owner, id).plan)
          .flatMap(_ =>
            db.transact(SendMessageMessage(owner, id, UUID.randomUUID(), "合成测试", 3).plan)
          )
          .flatMap(_ => db.transact(SetFavouriteMessage(owner, "rest", true).plan))
          .flatMap(_ => db.transact(AddMoodMessage(owner, UUID.randomUUID(), "平静", "合成手记").plan))
          .flatMap(_ =>
            db.transact(UpdatePreferencesMessage(owner, Preferences("测试访客", true, true)).plan)
          )
          .flatMap(_ => db.transact(GetStateMessage(owner).plan))
          .flatMap { saved =>
            assertEquals(saved.favourites, Vector("rest"))
            assertEquals(saved.moods.size, 1)
            assertEquals(saved.conversations.head.messages.size, 2)
            assertEquals(saved.preferences.nickname, "测试访客")
            db.transact(ClearDataMessage(owner).plan)
          }
          .flatMap(_ => db.transact(GetStateMessage(owner).plan))
          .map { empty =>
            assertEquals(empty.conversations.size, 0); assertEquals(empty.moods.size, 0)
            assertEquals(empty.favourites.size, 0);
            assertEquals(empty.preferences, Preferences("", false, false))
          }
      }
    )
  }
  test("非法正文和收藏不写入，不存在访客无法执行写操作") {
    withDatabase(db =>
      withOwner(db) { owner =>
        val id = UUID.randomUUID()
        db.transact(CreateConversationMessage(owner, id).plan)
          .flatMap(_ =>
            Vector(
              db.transact(SendMessageMessage(owner, id, UUID.randomUUID(), " " * 2001, 3).plan)
                .void,
              db.transact(SetFavouriteMessage(owner, "unknown", true).plan).void,
              db.transact(CreateConversationMessage(UUID.randomUUID(), UUID.randomUUID()).plan).void
            ).traverse(_.attempt)
          )
          .map(results => assert(results.forall(_.isLeft)))
      }
    )
  }
  test("前后端注册元数据共享同一命名规则") {
    IO.blocking(Files.readString(Paths.get("../frontend/src/system/api/message-names.json")))
      .flatMap(text => IO.fromEither(decode[Map[String, String]](text)))
      .map { metadata =>
        val registered = IdentityRoutes.apiMessages ++ ConversationsRoutes.apiMessages(
          3
        ) ++ JournalRoutes.apiMessages ++ CollectionRoutes.apiMessages
        assertEquals(registered.map(_.name).toSet, metadata.values.map(ApiEndpoint.routeName).toSet)
        assertEquals(registered.map(_.name).distinct.size, registered.size)
      }
  }
  test("取消事务也会回滚未提交的写入") {
    withDatabase(db =>
      withOwner(db) { owner =>
        val id = UUID.randomUUID()
        Deferred[IO, Unit].flatMap { inserted =>
          db.transact(connection =>
            MoodTable
              .insert(connection, owner, Mood(id.toString, "平静", "取消测试", "now"))
              .flatMap(_ => inserted.complete(()))
              .flatMap(_ => IO.never[Unit])
          ).start
            .flatMap { fiber =>
              inserted.get
                .flatMap(_ => fiber.cancel)
                .flatMap(_ => db.transact(connection => MoodTable.find(connection, owner, id)))
                .map(value => assertEquals(value, None))
            }
        }
      }
    )
  }
  test("HTTP 边界拒绝无身份和跨站写入") {
    withDatabase { db =>
      val endpoints = IdentityRoutes.apiMessages ++ ConversationsRoutes.apiMessages(
        3
      ) ++ JournalRoutes.apiMessages ++ CollectionRoutes.apiMessages
      val app = APIMessageRouter.routes(db, endpoints, Set("http://127.0.0.1:5173")).orNotFound
      val getState =
        Request[IO](Method.POST, Uri.unsafeFromString("/api/getstate")).withEntity(Json.obj())
      val crossSite = Request[IO](Method.POST, Uri.unsafeFromString("/api/startsession"))
        .putHeaders(Header.Raw(CIString("Origin"), "https://untrusted.example"))
      app
        .run(getState)
        .flatMap(response => IO(assertEquals(response.status, Status.Unauthorized)))
        .flatMap(_ => app.run(crossSite))
        .map(response => assertEquals(response.status, Status.Forbidden))
    }
  }
  test("请求正文伪造 ownerId 不改变路由已验证的身份") {
    withDatabase(db =>
      withOwner(db) { owner =>
        Resource
          .make(db.transact(StartSessionMessage().plan))(session =>
            db.transact(connection => SessionTable.delete(connection, session.ownerId))
          )
          .use { stranger =>
            val id = UUID.randomUUID()
            val endpoints = IdentityRoutes.apiMessages ++ ConversationsRoutes
              .apiMessages(3) ++ JournalRoutes.apiMessages ++ CollectionRoutes.apiMessages
            val app = APIMessageRouter.routes(db, endpoints, Set.empty).orNotFound
            val forged = Request[IO](Method.POST, Uri.unsafeFromString("/api/getconversation"))
              .withEntity(
                Json.obj(
                  "id" -> Json.fromString(id.toString),
                  "ownerId" -> Json.fromString(owner.toString)
                )
              )
              .putHeaders(Header.Raw(CIString("Cookie"), s"qiyu_session=${stranger.token}"))
            db.transact(CreateConversationMessage(owner, id).plan)
              .flatMap(_ => app.run(forged))
              .map(response => assertEquals(response.status, Status.NotFound))
          }
      }
    )
  }
