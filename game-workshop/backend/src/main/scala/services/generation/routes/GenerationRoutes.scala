package services.generation.routes
import services.system.api.Endpoint
import services.generation.api.*
import services.generation.objects.AcceptGenerationInput
import services.system.generation.GenerationExecutor
object GenerationRoutes:
  def apiMessages(executor: GenerationExecutor): List[Endpoint] = List(
    Endpoint.secured((owner: String, id: String) => GetGenerationMessage(owner,id)),
    Endpoint.phased((owner: String, id: String) => RetryGenerationMessage(owner,id))((owner,id,task) => executor.finish(owner,task.id,true)),
    Endpoint.secured((owner: String, in: AcceptGenerationInput) => AcceptGenerationMessage(owner,in))
  )
