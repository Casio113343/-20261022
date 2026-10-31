package services.system
import cats.effect.{IO,IOApp}
import cats.syntax.all.*
import com.comcast.ip4s.*
import org.http4s.ember.server.EmberServerBuilder
import services.system.database.Database
import services.system.api.APIMessageRouter
import services.catalog.routes.CatalogRoutes
import services.identity.routes.IdentityRoutes
import services.projects.routes.ProjectsRoutes
import services.assets.routes.AssetsRoutes
import services.artwork.routes.ArtworkRoutes
import services.identity.tables.SessionTable.SessionTableInitializer
import services.projects.tables.ProjectTable.ProjectTableInitializer
import services.assets.tables.AssetTable.AssetTableInitializer
import services.artwork.tables.ArtworkTable.ArtworkTableInitializer
import services.projects.tables.GameVersionTable.GameVersionTableInitializer
import services.system.artwork.{ArtworkExecutor,UnconfiguredArtworkProvider}
import services.library.routes.LibraryRoutes
import services.library.tables.ResourceTable.ResourceTableInitializer
import services.library.tables.ProjectResourceTable.ProjectResourceTableInitializer
import services.characters.routes.CharacterDesignRoutes
import services.worldbuilding.routes.WorldDesignRoutes
import services.skills.routes.SkillDesignRoutes
import services.materials.routes.GameMaterialRoutes
import services.imageediting.routes.ImageEditRoutes
import services.promotion.routes.PromotionRoutes
object Main extends IOApp.Simple:
  def run: IO[Unit] = IO.delay(sys.env).flatMap { env =>
    val db = Database(env.getOrElse("DATABASE_URL","jdbc:postgresql://127.0.0.1:55433/workshop"),env.getOrElse("DATABASE_USER","workshop"),env.getOrElse("DATABASE_PASSWORD",""))
    val generation = services.system.generation.GenerationExecutor(db,services.system.generation.HttpGenerationProvider(env.get("GENERATION_GATEWAY_URL"),env.get("GENERATION_GATEWAY_TOKEN"),java.net.http.HttpClient.newBuilder().connectTimeout(java.time.Duration.ofSeconds(10)).build()))
    val port = env.get("PORT").flatMap(_.toIntOption).flatMap(Port.fromInt).getOrElse(port"8080")
    val executor = ArtworkExecutor(db,new UnconfiguredArtworkProvider)
    db.transaction(c => SessionTableInitializer.initialize(c) *> ProjectTableInitializer.initialize(c) *> AssetTableInitializer.initialize(c) *> ArtworkTableInitializer.initialize(c) *> GameVersionTableInitializer.initialize(c) *> ResourceTableInitializer.initialize(c) *> ProjectResourceTableInitializer.initialize(c) *> services.generation.tables.GenerationTable.GenerationTableInitializer.initialize(c)) *>
      EmberServerBuilder.default[IO].withHost(host"127.0.0.1").withPort(port).withHttpApp(APIMessageRouter.routes(db,CatalogRoutes.apiMessages ++ IdentityRoutes.apiMessages ++ ProjectsRoutes.liveApiMessages(executor) ++ AssetsRoutes.apiMessages ++ ArtworkRoutes.apiMessages(executor) ++ LibraryRoutes.apiMessages ++ CharacterDesignRoutes.apiMessages ++ WorldDesignRoutes.apiMessages ++ SkillDesignRoutes.apiMessages ++ GameMaterialRoutes.apiMessages ++ ImageEditRoutes.apiMessages ++ PromotionRoutes.apiMessages ++ services.generation.routes.GenerationRoutes.apiMessages(generation) ++ CharacterDesignRoutes.generationMessages(generation) ++ WorldDesignRoutes.generationMessages(generation) ++ SkillDesignRoutes.generationMessages(generation) ++ GameMaterialRoutes.generationMessages(generation) ++ ImageEditRoutes.generationMessages(generation) ++ PromotionRoutes.generationMessages(generation)).orNotFound).build.use(server => IO.println(s"Game Workshop backend: http://127.0.0.1:${server.address.getPort}") *> IO.never)
  }
