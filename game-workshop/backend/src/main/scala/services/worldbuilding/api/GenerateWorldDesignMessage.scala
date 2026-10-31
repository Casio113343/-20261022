package services.worldbuilding.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.generation.objects.{GenerationInput,GenerationTask}
import services.generation.api.RequestGenerationMessage
final case class GenerateWorldDesignMessage(ownerId: String, request: GenerationInput) extends APIMessage[GenerationTask]:
  def plan(c: Connection): IO[GenerationTask] = RequestGenerationMessage(ownerId,"world",request).plan(c)
