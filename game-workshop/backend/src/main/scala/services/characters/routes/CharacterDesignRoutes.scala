package services.characters.routes
import io.circe.Json
import services.system.api.Endpoint
import services.library.objects.apiTypes.ResourceSaveInput
import services.characters.api.*
object CharacterDesignRoutes:
  val apiMessages: List[Endpoint] = List(
    Endpoint.secured((owner: String, in: ResourceSaveInput) => SaveCharacterDesignMessage(owner,in)),
    Endpoint.secured((owner: String, in: Json) => ListCharacterDesignsMessage(owner))
  )
