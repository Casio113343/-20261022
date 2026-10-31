package services.skills.routes
import io.circe.Json
import services.system.api.Endpoint
import services.library.objects.apiTypes.ResourceSaveInput
import services.skills.api.*
object SkillDesignRoutes:
  val apiMessages: List[Endpoint] = List(
    Endpoint.secured((owner: String, in: ResourceSaveInput) => SaveSkillDesignMessage(owner,in)),
    Endpoint.secured((owner: String, in: Json) => ListSkillDesignsMessage(owner))
  )
