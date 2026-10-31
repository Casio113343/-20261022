package services.artwork
import services.{Fixtures,TestArtworkProvider}
import cats.effect.{IO,Ref}
import cats.syntax.all.*
import munit.CatsEffectSuite
import java.util.UUID
import services.system.database.Database
import services.system.artwork.{ArtworkExecutor,UnconfiguredArtworkProvider}
import services.system.api.APIMessageRouter
import services.identity.api.StartSessionMessage
import services.identity.tables.SessionTable.SessionTableInitializer
import services.projects.api.*
import services.projects.objects.{Project,GameInput}
import services.projects.objects.apiTypes.*
import services.projects.tables.ProjectTable.ProjectTable
import services.projects.tables.GameVersionTable.GameVersionTableInitializer
import services.artwork.api.*
import services.artwork.objects.*
import services.artwork.objects.apiTypes.*
import services.artwork.tables.ArtworkTable.ArtworkTableInitializer
import services.assets.tables.AssetTable.{AssetTable,AssetTableInitializer}
import services.projects.tables.ProjectTable.ProjectTableInitializer
import services.projects.routes.ProjectsRoutes
import services.artwork.routes.ArtworkRoutes
import org.http4s.*
import org.http4s.circe.*
import org.typelevel.ci.CIString
import io.circe.Json
import scala.concurrent.duration.*
class ArtworkIntegrationSuite extends CatsEffectSuite:
  private def db: IO[Database] = IO.delay(sys.env).map(e => Database(e.getOrElse("DATABASE_URL","jdbc:postgresql://127.0.0.1:55433/workshop"),e.getOrElse("DATABASE_USER","workshop"),e.getOrElse("DATABASE_PASSWORD",""))).flatTap(d => d.transaction(c => SessionTableInitializer.initialize(c) *> ProjectTableInitializer.initialize(c) *> AssetTableInitializer.initialize(c) *> ArtworkTableInitializer.initialize(c) *> GameVersionTableInitializer.initialize(c)))
  private def fixture[A](f: (Database,String,String,Project) => IO[A]): IO[A] = db.flatMap { d =>
    d.transaction(c => StartSessionMessage().plan(c)).flatMap { session => IO.delay(UUID.randomUUID().toString).flatMap { requestId =>
      d.transaction(c => CreateProjectMessage(session.ownerId,CreateProjectInput(requestId,Fixtures.input)).plan(c)).flatMap { p =>
        d.transaction(c => PreparePlanMessage(session.ownerId,ProjectVersionInput(p.id,p.version)).plan(c)).flatMap(prepared => d.transaction(c => ConfirmPlanMessage(session.ownerId,ProjectVersionInput(p.id,prepared.version)).plan(c))).flatMap(confirmed => f(d,session.ownerId,session.token,confirmed)).guarantee(d.transaction(c => DeleteProjectMessage(session.ownerId,p.id).plan(c)).attempt.void)
      }
    }}
  }
  private def generate(d: Database, owner: String, p: Project, executor: ArtworkExecutor): IO[GameBuildResult] =
    d.transaction(c => GenerateGameMessage(owner,ProjectVersionInput(p.id,p.version),executor.provider.configured).plan(c)).flatMap { first =>
      executor.runPending(owner,p.id,first.artwork) *> d.transaction(c => GenerateGameMessage(owner,ProjectVersionInput(p.id,p.version),executor.provider.configured).plan(c))
    }
  test("真实持久化：生成原图和加工图，规则修改复用哈希，局部编辑和历史恢复") {
    fixture { (d,owner,_,p) => Ref.of[IO,List[String]](Nil).flatMap { calls =>
      val executor = ArtworkExecutor(d,TestArtworkProvider(calls,IO.unit))
      generate(d,owner,p,executor).flatMap { first =>
        val original = first.project.artifact.toList.flatMap(_.artworkBindings)
        IO { assertEquals(first.status,"prototype_ready"); assertEquals(original.size,3) } *>
        d.transaction(c => SaveProjectMessage(owner,SaveProjectInput(p.id,p.version,p.input.copy(requirements="只调整攻击伤害"))).plan(c)).flatMap { saved =>
          d.transaction(c => PreparePlanMessage(owner,ProjectVersionInput(p.id,saved.version)).plan(c)).flatMap(prepared => d.transaction(c => ConfirmPlanMessage(owner,ProjectVersionInput(p.id,prepared.version)).plan(c))).flatMap { next =>
            generate(d,owner,next,executor).flatMap { reused =>
              IO(assertEquals(reused.project.artifact.toList.flatMap(_.artworkBindings),original)) *> calls.get.flatMap(log => IO(assertEquals(log.size,3))) *>
              d.transaction(c => RequestArtworkEditMessage(owner,ArtworkEditInput(p.id,next.version,reused.artwork.revision,"scene-edit",List("scene"),"只改为夜晚，保留场景结构")).plan(c)).flatMap { edited =>
                executor.runPending(owner,p.id,edited) *> d.transaction(c => GenerateGameMessage(owner,ProjectVersionInput(p.id,next.version),true).plan(c)).flatMap { updated =>
                  val bindings = updated.project.artifact.toList.flatMap(_.artworkBindings)
                  val oldScene = original.find(_.slotId == "scene").getOrElse(fail("scene"))
                  val newScene = bindings.find(_.slotId == "scene").getOrElse(fail("new scene"))
                  IO { assertEquals(bindings.filterNot(_.slotId == "scene"),original.filterNot(_.slotId == "scene")); assertNotEquals(newScene.originalHash,oldScene.originalHash) } *>
                    d.transaction(c => AssetTable.find(c,owner,oldScene.originalAssetId)).flatMap(a => IO(assert(a.nonEmpty))) *>
                    d.transaction(c => RestoreArtworkRevisionMessage(owner,ArtworkRestoreInput(p.id,next.version,updated.artwork.revision,oldScene.revisionId)).plan(c)).flatMap(restored => IO(assertEquals(services.artwork.utils.ManifestRules.bindings(restored),original))) *>
                    d.transaction(c => ListGameVersionsMessage(owner,p.id).plan(c)).flatMap(history => IO { assert(history.size >= 3); assert(history.flatMap(_.artifact).exists(_.artworkBindings == original)) })
                }
              }
            }
          }
        }
      }
    }}
  }
  test("HTTP分阶段执行：模型调用时原事务已释放，重复请求不重画") {
    fixture { (d,owner,token,p) => Ref.of[IO,List[String]](Nil).flatMap { calls =>
      // 在图片服务替身中再次锁同一作品；若路由仍持有原事务则超时。
      val before = d.transaction(c => ProjectTable.find(c,owner,p.id)).void.timeout(3.seconds)
      val executor = ArtworkExecutor(d,TestArtworkProvider(calls,before))
      val app = APIMessageRouter.routes(d,ProjectsRoutes.liveApiMessages(executor) ++ ArtworkRoutes.apiMessages(executor)).orNotFound
      val body = Json.obj("projectId" -> Json.fromString(p.id),"expectedVersion" -> Json.fromInt(p.version))
      val request = Request[IO](Method.POST,Uri.unsafeFromString("/api/generategame")).withHeaders(Header.Raw(CIString("Authorization"),s"Bearer $token")).withEntity(body)
      app.run(request).flatMap(r => r.as[Json].flatMap(json => IO { assertEquals(r.status.code,200); assertEquals(json.hcursor.get[String]("status"),Right("prototype_ready")) })) *>
        app.run(request).flatMap(r => IO(assertEquals(r.status.code,200))) *> calls.get.flatMap(log => IO(assertEquals(log.size,3)))
    }}
  }
  test("缺少模型不会宣称完成；他人不能读任务或处理任务") {
    fixture { (d,owner,_,p) =>
      val executor = ArtworkExecutor(d,new UnconfiguredArtworkProvider)
      d.transaction(c => GenerateGameMessage(owner,ProjectVersionInput(p.id,p.version)).plan(c)).flatMap { result =>
        val task = result.artwork.tasks.head
        d.transaction(c => ProcessArtworkTaskMessage(owner,ArtworkTaskInput(p.id,task.id),false).plan(c)).flatMap(executor.finish(owner,p.id,_)).flatMap(blocked => IO { assertEquals(result.status,"waiting_for_provider"); assertEquals(result.project.artifact,None); assertEquals(blocked.status,TaskStatus.Blocked) }) *>
          d.transaction(c => GetArtworkManifestMessage("intruder",p.id).plan(c)).attempt.flatMap(e => IO(assert(e.isLeft))) *>
          d.transaction(c => ProcessArtworkTaskMessage("intruder",ArtworkTaskInput(p.id,task.id),true).plan(c)).attempt.flatMap(e => IO(assert(e.isLeft)))
      }
    }
  }
  test("部分生成失败只重试失败任务，已成功原图与成品不改变") {
    fixture { (d,owner,_,p) => Ref.of[IO,List[String]](Nil).flatMap { calls =>
      val failing = ArtworkExecutor(d,TestArtworkProvider(calls,IO.unit,Some("scene")))
      generate(d,owner,p,failing).flatMap { failed =>
        val saved = services.artwork.utils.ManifestRules.bindings(failed.artwork)
        val task = failed.artwork.tasks.find(_.status == TaskStatus.Failed).getOrElse(fail("failed task"))
        IO(assertEquals(failed.status,"artwork_failed")) *> d.transaction(c => RetryArtworkTaskMessage(owner,ArtworkTaskInput(p.id,task.id)).plan(c)).flatMap { retried =>
          val executor = ArtworkExecutor(d,TestArtworkProvider(calls,IO.unit))
          executor.runPending(owner,p.id,retried) *> d.transaction(c => GenerateGameMessage(owner,ProjectVersionInput(p.id,p.version),true).plan(c)).flatMap { success =>
            IO { assertEquals(success.status,"prototype_ready"); assertEquals(services.artwork.utils.ManifestRules.bindings(success.artwork).filterNot(_.slotId == "scene"),saved) } *>
              calls.get.flatMap(log => IO { assertEquals(log.count(_ == "generate:scene"),2); assertEquals(log.count(_ == "generate:character-default"),1) })
          }
        }
      }
    }}
  }
