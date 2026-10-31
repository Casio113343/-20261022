package services.projects.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.system.api.APIMessage
import services.projects.objects.apiTypes.{ProjectVersionInput,GameBuildResult}
import services.projects.tables.ProjectTable.ProjectTable
import services.projects.tables.GameVersionTable.GameVersionTable
import services.artwork.api.{PrepareArtworkMessage,GetArtworkReadinessMessage}
import services.artwork.objects.apiTypes.ArtworkPlanInput
import services.projects.utils.ProjectRules
final case class GenerateGameMessage(ownerId: String, request: ProjectVersionInput, providerConfigured: Boolean = false) extends APIMessage[GameBuildResult]:
  def plan(c: Connection): IO[GameBuildResult] =
    ProjectTable.find(c,ownerId,request.projectId).flatMap(p =>
      IO.raiseUnless(services.catalog.objects.GenreCatalog.all.exists(g => g.id == p.input.genreId && g.support == "prototype"))(services.system.api.ApiError("unsupported","该类型暂不支持制作",status=422))) *>
    PrepareArtworkMessage(ownerId,ArtworkPlanInput(request.projectId,request.expectedVersion)).plan(c) *> GetArtworkReadinessMessage(ownerId,request.projectId).plan(c).flatMap { readiness =>
      val manifest = readiness.manifest
      ProjectTable.find(c,ownerId,request.projectId).flatMap { project =>
        if !readiness.ready then IO.pure(GameBuildResult(if readiness.hasFailures then "artwork_failed" else if providerConfigured then "artwork_pending" else "waiting_for_provider",project,manifest,"所需美术尚未完成，当前不是完整游戏。"))
        else IO.delay(UUID.randomUUID().toString).flatMap(id => IO.realTimeInstant.flatMap(now => IO.fromEither(ProjectRules.generate(project,request.expectedVersion,now.toString,id,readiness.bindings)))).flatMap { next =>
          ProjectTable.update(c,project.version,next) *> GameVersionTable.insert(c,next).as(GameBuildResult("prototype_ready",next,manifest,"美术已绑定到规则原型配置；图形运行器的实际加载仍需前端验证。"))
        }
      }
    }
