package services
import cats.effect.IO
import cats.syntax.all.*
import munit.CatsEffectSuite
import io.circe.Json
import io.circe.syntax.*
import java.util.UUID
import services.system.database.Database
import services.system.api.{APIMessageRouter,ApiError}
import services.identity.api.StartSessionMessage
import services.projects.api.*
import services.projects.objects.apiTypes.*
import services.assets.api.UploadAssetMessage
import services.assets.objects.apiTypes.UploadAssetInput
import services.identity.tables.SessionTable.SessionTableInitializer
import services.projects.tables.ProjectTable.ProjectTableInitializer
import services.assets.tables.AssetTable.AssetTableInitializer
import services.artwork.tables.ArtworkTable.ArtworkTableInitializer
import services.projects.tables.GameVersionTable.GameVersionTableInitializer
import services.catalog.routes.CatalogRoutes
import services.identity.routes.IdentityRoutes
import services.projects.routes.ProjectsRoutes
import services.assets.routes.AssetsRoutes
import org.http4s.*
import org.http4s.circe.*
class IntegrationSuite extends CatsEffectSuite:
  def database: IO[Database] = IO.delay(sys.env).map(e => Database(e.getOrElse("DATABASE_URL","jdbc:postgresql://127.0.0.1:55433/workshop"),e.getOrElse("DATABASE_USER","workshop"),e.getOrElse("DATABASE_PASSWORD","")))
  def initialized: IO[Database] = database.flatTap(db => db.transaction(c => SessionTableInitializer.initialize(c) *> ProjectTableInitializer.initialize(c) *> AssetTableInitializer.initialize(c) *> ArtworkTableInitializer.initialize(c) *> GameVersionTableInitializer.initialize(c)))
  test("PostgreSQL：创建幂等、持久化、私有访问、版本竞争与删除") {
    initialized.flatMap { db =>
      db.transaction(c => StartSessionMessage().plan(c)).flatMap { session =>
        IO.delay(UUID.randomUUID().toString).flatMap { requestId =>
          val create = CreateProjectMessage(session.ownerId,CreateProjectInput(requestId,Fixtures.input))
          db.transaction(create.plan).flatMap { p =>
            db.transaction(create.plan).flatMap(second => IO(assertEquals(second.id,p.id))) *>
            db.transaction(c => GetProjectMessage("someone-else",p.id).plan(c)).attempt.flatMap(result => IO(assert(result.isLeft))) *>
            (db.transaction(c => SaveProjectMessage(session.ownerId,SaveProjectInput(p.id,0,Fixtures.input.copy(title="一"))).plan(c)).attempt,
             db.transaction(c => SaveProjectMessage(session.ownerId,SaveProjectInput(p.id,0,Fixtures.input.copy(title="二"))).plan(c)).attempt).parTupled.flatMap { case (a,b) => IO(assertEquals(List(a,b).count(_.isRight),1)) } *>
            db.transaction(c => GetProjectMessage(session.ownerId,p.id).plan(c)).flatMap(saved => IO(assertEquals(saved.version,1))) *>
            db.transaction(c => DeleteProjectMessage(session.ownerId,p.id).plan(c)).void
          }
        }
      }
    }
  }
  test("HTTP：公开分类、身份校验、非法JSON及自动消息名称") {
    initialized.flatMap { db =>
      val app = APIMessageRouter.routes(db,CatalogRoutes.apiMessages ++ IdentityRoutes.apiMessages ++ ProjectsRoutes.apiMessages ++ AssetsRoutes.apiMessages).orNotFound
      val public = Request[IO](Method.POST,Uri.unsafeFromString("/api/listgenres")).withEntity(Json.obj())
      val denied = Request[IO](Method.POST,Uri.unsafeFromString("/api/listprojects")).withEntity(Json.obj())
      val broken = Request[IO](Method.POST,Uri.unsafeFromString("/api/listgenres")).withEntity("{")
      List(public,denied,broken).traverse(app.run).flatMap(rs => IO(assertEquals(rs.map(_.status.code),List(200,401,400))))
    }
  }
  test("图片拒绝伪装格式与无效编码") {
    initialized.flatMap(db => db.transaction(c => StartSessionMessage().plan(c)).flatMap(s =>
      List(UploadAssetInput("image/png","aGVsbG8="),UploadAssetInput("image/svg+xml","aA=="),UploadAssetInput("image/png","!!!")).traverse(in => db.transaction(c => UploadAssetMessage(s.ownerId,in).plan(c)).attempt).flatMap(results => IO(assert(results.forall(_.isLeft))))))
  }
  test("方案确认持久化，修改资料后不能复用旧确认生成") {
    initialized.flatMap(db => db.transaction(c => StartSessionMessage().plan(c)).flatMap { s =>
      IO.delay(UUID.randomUUID().toString).flatMap { requestId =>
        db.transaction(c => CreateProjectMessage(s.ownerId,CreateProjectInput(requestId,Fixtures.input)).plan(c)).flatMap { p =>
          db.transaction(c => PreparePlanMessage(s.ownerId,ProjectVersionInput(p.id,p.version)).plan(c)).flatMap { prepared =>
            db.transaction(c => ConfirmPlanMessage(s.ownerId,ProjectVersionInput(p.id,prepared.version)).plan(c)).flatMap { confirmed =>
              db.transaction(c => GenerateGameMessage(s.ownerId,ProjectVersionInput(p.id,confirmed.version)).plan(c)).flatMap { generated =>
                IO { assertEquals(generated.status,"waiting_for_provider"); assertEquals(generated.project.artifact,None) } *>
                db.transaction(c => SaveProjectMessage(s.ownerId,SaveProjectInput(p.id,generated.project.version,Fixtures.input.copy(requirements="新的设计"))).plan(c)).flatMap { changed =>
                  IO(assertEquals(changed.plan,None)) *>
                  db.transaction(c => GenerateGameMessage(s.ownerId,ProjectVersionInput(p.id,changed.version)).plan(c)).attempt.flatMap(result => IO(assert(result.isLeft)))
                }
              }
            }
          } *> db.transaction(c => DeleteProjectMessage(s.ownerId,p.id).plan(c)).void
        }
      }
    })
  }
