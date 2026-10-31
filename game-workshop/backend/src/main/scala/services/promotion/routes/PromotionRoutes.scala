package services.promotion.routes
import io.circe.Json
import services.system.api.Endpoint
import services.library.objects.apiTypes.ResourceSaveInput
import services.promotion.api.*
object PromotionRoutes:
  val apiMessages: List[Endpoint] = List(
    Endpoint.secured((owner: String, in: ResourceSaveInput) => SavePromotionMessage(owner,in)),
    Endpoint.secured((owner: String, in: Json) => ListPromotionsMessage(owner))
  )
