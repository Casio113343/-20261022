package services.imageediting.routes
import io.circe.Json
import services.system.api.Endpoint
import services.library.objects.apiTypes.ResourceSaveInput
import services.imageediting.api.*
object ImageEditRoutes:
  val apiMessages: List[Endpoint] = List(
    Endpoint.secured((owner: String, in: ResourceSaveInput) => SaveImageEditMessage(owner,in)),
    Endpoint.secured((owner: String, in: Json) => ListImageEditsMessage(owner))
  )
