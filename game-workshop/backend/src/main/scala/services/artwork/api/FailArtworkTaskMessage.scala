package services.artwork.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.artwork.objects.ArtworkTask
import services.artwork.utils.{ArtworkEffects,ManifestRules}
final case class FailArtworkTaskMessage(ownerId: String, projectId: String, taskId: String, token: String, reason: String) extends APIMessage[ArtworkTask]:
  def plan(c: Connection): IO[ArtworkTask] = ArtworkEffects.change(c,ownerId,projectId)(old => Right(ManifestRules.fail(old,taskId,token,reason))).flatMap(state => IO.fromOption(state.tasks.find(_.id == taskId))(ApiError("not_found","任务不存在",status=404)))
