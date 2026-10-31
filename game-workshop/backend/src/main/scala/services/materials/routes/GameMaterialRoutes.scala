package services.materials.routes
import io.circe.Json
import services.system.api.Endpoint
import services.library.objects.apiTypes.ResourceSaveInput
import services.materials.api.*
object GameMaterialRoutes:
  val apiMessages: List[Endpoint] = List(
    Endpoint.secured((owner: String, in: ResourceSaveInput) => SaveGameMaterialMessage(owner,in)),
    Endpoint.secured((owner: String, in: Json) => ListGameMaterialsMessage(owner))
  )
