package services.library.routes
import io.circe.Json
import services.system.api.Endpoint
import services.library.api.*
import services.library.objects.apiTypes.*
import services.projects.objects.apiTypes.ProjectIdInput
object LibraryRoutes:
  val apiMessages: List[Endpoint] = List(
    Endpoint.secured((owner: String, in: Json) => ListResourcesMessage(owner)),
    Endpoint.secured((owner: String, in: String) => GetResourceMessage(owner,in)),
    Endpoint.secured((owner: String, in: ResourceAttachInput) => AttachResourceMessage(owner,in)),
    Endpoint.secured((owner: String, in: ProjectIdInput) => ListProjectResourcesMessage(owner,in.projectId))
  )
