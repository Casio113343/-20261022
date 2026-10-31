package services.projects.routes
import io.circe.Json
import services.system.api.Endpoint
import services.projects.api.*
import services.projects.objects.apiTypes.*
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
    Endpoint.secured((owner: String,in: ProjectVersionInput) => GenerateGameMessage(owner,in))
  )
