package services.generation.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.generation.objects.GenerationTask
import services.generation.tables.GenerationTable.GenerationTable
final case class GetGenerationMessage(ownerId: String, taskId: String) extends APIMessage[GenerationTask]:
  def plan(c: Connection): IO[GenerationTask] = GenerationTable.find(c,ownerId,taskId).flatMap(t => IO.fromOption(t)(ApiError("not_found","任务不存在或无权读取",status=404)))
