package services
import cats.effect.{IO,IOApp,Ref}
import com.comcast.ip4s.*
import org.http4s.ember.server.EmberServerBuilder
import services.system.database.Database
import services.system.api.APIMessageRouter
import services.system.artwork.ArtworkExecutor
import services.identity.tables.SessionTable.SessionTableInitializer
import services.projects.tables.ProjectTable.ProjectTableInitializer
import services.assets.tables.AssetTable.AssetTableInitializer
import services.artwork.tables.ArtworkTable.ArtworkTableInitializer
import services.projects.tables.GameVersionTable.GameVersionTableInitializer
import services.catalog.routes.CatalogRoutes
import services.identity.routes.IdentityRoutes
import services.projects.routes.ProjectsRoutes
import services.assets.routes.AssetsRoutes
import services.artwork.routes.ArtworkRoutes
// 仅测试类路径可启动，显式开关、独立端口和合成图片，不能作为正式图片服务。
object FrontendFixtureServer extends IOApp.Simple:
  def run: IO[Unit] = IO.delay(sys.env).flatMap { env =>
    IO.raiseUnless(env.get("WORKSHOP_UI_TEST").contains("1"))(new IllegalStateException("仅允许显式启动前端验收服务")) *>
      Ref.of[IO,List[String]](Nil).flatMap { calls =>
        val db = Database(env.getOrElse("DATABASE_URL","jdbc:postgresql://127.0.0.1:55433/workshop"),env.getOrElse("DATABASE_USER","workshop"),env.getOrElse("DATABASE_PASSWORD",""))
        val executor = ArtworkExecutor(db,TestArtworkProvider(calls,IO.unit))
        db.transaction(c => SessionTableInitializer.initialize(c) *> ProjectTableInitializer.initialize(c) *> AssetTableInitializer.initialize(c) *> ArtworkTableInitializer.initialize(c) *> GameVersionTableInitializer.initialize(c)) *>
          EmberServerBuilder.default[IO].withHost(host"127.0.0.1").withPort(port"8081").withHttpApp(APIMessageRouter.routes(db,CatalogRoutes.apiMessages ++ IdentityRoutes.apiMessages ++ ProjectsRoutes.liveApiMessages(executor) ++ AssetsRoutes.apiMessages ++ ArtworkRoutes.apiMessages(executor)).orNotFound).build.use(_ => IO.println("TEST ONLY: frontend fixture backend http://127.0.0.1:8081") *> IO.never)
      }
  }
