package services.generation.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.generation.objects.GenerationTask
final case class RetryGenerationMessage(ownerId: String, taskId: String) extends APIMessage[GenerationTask]:
  def plan(c: Connection): IO[GenerationTask] = GetGenerationMessage(ownerId,taskId).plan(c)
