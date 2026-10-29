package services.system
import cats.effect.{IO, IOApp}
import cats.syntax.all.*
import com.comcast.ip4s.*
import scala.concurrent.duration.*
import org.http4s.ember.server.EmberServerBuilder
import org.http4s.server.middleware.EntityLimiter
import services.system.database.{Database, Schema}
import services.system.api.APIMessageRouter
import services.identity.tables.SessionTable.SessionTable
import services.identity.routes.IdentityRoutes
import services.conversations.routes.ConversationsRoutes
import services.journal.routes.JournalRoutes
import services.collection.routes.CollectionRoutes
object Main extends IOApp.Simple:
  def run: IO[Unit] = IO.delay(sys.env).flatMap { env =>
    val port = env.get("QIYU_PORT").flatMap(_.toIntOption).getOrElse(8080)
    val turns = env.get("QIYU_MINIMUM_TURNS").flatMap(_.toIntOption).getOrElse(3)
    val origins = env
      .getOrElse(
        "QIYU_ALLOWED_ORIGINS",
        "http://127.0.0.1:5173,http://localhost:5173,http://127.0.0.1:8080"
      )
      .split(",")
      .map(_.trim)
      .toSet
    val password = env
      .get("QIYU_DB_PASSWORD")
      .filter(_.nonEmpty)
      .toRight(new IllegalArgumentException("QIYU_DB_PASSWORD is required"))
    IO.fromEither(password).flatMap { secret =>
      if turns < 1 || turns > 20 then
        IO.raiseError(new IllegalArgumentException("QIYU_MINIMUM_TURNS must be 1..20"))
      else
        IO.fromOption(Port.fromInt(port))(new IllegalArgumentException("Invalid QIYU_PORT"))
          .flatMap { serverPort =>
            Database
              .resource(
                env.getOrElse("QIYU_DB_URL", "jdbc:postgresql://127.0.0.1:55432/qiyu"),
                env.getOrElse("QIYU_DB_USER", "qiyu"),
                secret
              )
              .use { database =>
                database
                  .transact(Schema.initialize)
                  .flatMap(_ => database.transact(SessionTable.purgeExpired))
                  .flatMap { _ =>
                    val endpoints = IdentityRoutes.apiMessages ++ ConversationsRoutes.apiMessages(
                      turns
                    ) ++ JournalRoutes.apiMessages ++ CollectionRoutes.apiMessages
                    val app = EntityLimiter.httpApp[IO](
                      APIMessageRouter.routes(database, endpoints, origins).orNotFound,
                      32768L
                    )
                    (IO
                      .sleep(1.hour)
                      .flatMap(_ => database.transact(SessionTable.purgeExpired))
                      .handleErrorWith(_ => IO.println("过期访客清理失败，将在一小时后重试。")))
                      .foreverM
                      .background
                      .use { _ =>
                        EmberServerBuilder
                          .default[IO]
                          .withHost(ipv4"127.0.0.1")
                          .withPort(serverPort)
                          .withHttpApp(app)
                          .build
                          .use { _ =>
                            IO.println(
                              s"Qiyu backend: http://127.0.0.1:$port (demo replies, PostgreSQL)"
                            ).flatMap(_ => IO.never)
                          }
                      }
                  }
              }
          }
    }
  }
