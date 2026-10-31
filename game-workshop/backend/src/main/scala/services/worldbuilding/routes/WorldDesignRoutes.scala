package services.worldbuilding.routes
import io.circe.Json
import services.system.api.Endpoint
import services.library.objects.apiTypes.ResourceSaveInput
import services.worldbuilding.api.*
object WorldDesignRoutes:
  val apiMessages: List[Endpoint] = List(
    Endpoint.secured((owner: String, in: ResourceSaveInput) => SaveWorldDesignMessage(owner,in)),
    Endpoint.secured((owner: String, in: Json) => ListWorldDesignsMessage(owner))
  )

  def generationMessages(executor: services.system.generation.GenerationExecutor): List[Endpoint] = List(
    Endpoint.phased((owner: String, in: services.generation.objects.GenerationInput) => GenerateWorldDesignMessage(owner,in))((owner,in,task) => executor.finish(owner,task.id))
  )
