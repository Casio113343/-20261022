package services.projects.routes
import io.circe.Json
import services.system.api.Endpoint
import services.projects.api.*
import services.projects.objects.apiTypes.*
import services.system.artwork.ArtworkExecutor
import cats.effect.IO
object ProjectsRoutes:
  val apiMessages = List(
    Endpoint.secured((owner: String,in: CreateProjectInput) => CreateProjectMessage(owner,in)),
    Endpoint.secured((owner: String,in: Json) => ListProjectsMessage(owner)),
    Endpoint.secured((owner: String,in: ProjectIdInput) => GetProjectMessage(owner,in.projectId)),
    Endpoint.secured((owner: String,in: ProjectIdInput) => DeleteProjectMessage(owner,in.projectId)),
    Endpoint.secured((owner: String,in: SaveProjectInput) => SaveProjectMessage(owner,in)),
    Endpoint.secured((owner: String,in: ProjectVersionInput) => PreparePlanMessage(owner,in)),
    Endpoint.secured((owner: String,in: RevisePlanInput) => RevisePlanMessage(owner,in)),
    Endpoint.secured((owner: String,in: ProjectVersionInput) => ConfirmPlanMessage(owner,in)),
    Endpoint.secured((owner: String,in: ProjectVersionInput) => GenerateGameMessage(owner,in)),
    Endpoint.secured((owner: String,in: ProjectIdInput) => ListGameVersionsMessage(owner,in.projectId))
  )
  def liveApiMessages(executor: ArtworkExecutor): List[Endpoint] = apiMessages.filterNot(_.name == Endpoint.nameOf[GenerateGameMessage]) :+
    Endpoint.phased((owner: String,in: ProjectVersionInput) => GenerateGameMessage(owner,in,executor.provider.configured)) { (owner,in,result) =>
      if result.status != "artwork_pending" then IO.pure(result)
      else executor.runPending(owner,in.projectId,result.artwork).flatMap(_ => executor.database.transaction(c => GenerateGameMessage(owner,in,true).plan(c)))
    }
