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

  def generationMessages(executor: services.system.generation.GenerationExecutor): List[Endpoint] = List(
    Endpoint.phased((owner: String, in: services.generation.objects.GenerationInput) => GenerateCharacterDesignMessage(owner,in))((owner,in,task) => executor.finish(owner,task.id))
  )
