package services.materials.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.generation.objects.{GenerationInput,GenerationTask}
import services.generation.api.RequestGenerationMessage
final case class GenerateGameMaterialMessage(ownerId: String, request: GenerationInput) extends APIMessage[GenerationTask]:
  def plan(c: Connection): IO[GenerationTask] = RequestGenerationMessage(ownerId,"asset",request).plan(c)
