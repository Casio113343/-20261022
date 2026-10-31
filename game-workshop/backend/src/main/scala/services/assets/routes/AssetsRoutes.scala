package services.assets.routes
import services.system.api.Endpoint
import services.assets.api.*
import services.assets.objects.apiTypes.UploadAssetInput
import services.projects.objects.apiTypes.ProjectIdInput
import io.circe.Json
import services.system.api.ApiError
object AssetsRoutes:
  val apiMessages = List(
    Endpoint.secured((owner: String,in: UploadAssetInput) => UploadAssetMessage(owner,in)),
    Endpoint.secured((owner: String,in: String) => GetAssetMessage(owner,in))
  )
