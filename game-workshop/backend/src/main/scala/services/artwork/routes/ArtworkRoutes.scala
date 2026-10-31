package services.artwork.routes
import services.system.api.Endpoint
import services.artwork.api.*
import services.artwork.objects.apiTypes.*
import services.projects.objects.apiTypes.{ProjectVersionInput,ProjectIdInput}
import services.system.artwork.ArtworkExecutor
object ArtworkRoutes:
  def apiMessages(executor: ArtworkExecutor): List[Endpoint] = List(
    Endpoint.secured((owner: String,in: ProjectVersionInput) => GetArtworkRequirementsMessage(owner,in)),
    Endpoint.secured((owner: String,in: ProjectIdInput) => GetArtworkManifestMessage(owner,in.projectId)),
    Endpoint.secured((owner: String,in: ArtworkPlanInput) => PrepareArtworkMessage(owner,in)),
    Endpoint.secured((owner: String,in: ArtworkEditInput) => RequestArtworkEditMessage(owner,in)),
    Endpoint.secured((owner: String,in: ArtworkTaskInput) => RetryArtworkTaskMessage(owner,in)),
    Endpoint.secured((owner: String,in: ArtworkRestoreInput) => RestoreArtworkRevisionMessage(owner,in)),
    Endpoint.phased((owner: String,in: ArtworkTaskInput) => ProcessArtworkTaskMessage(owner,in,executor.provider.configured))((owner,in,task) => executor.finish(owner,in.projectId,task))
  )
