package services.artwork.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.system.api.{APIMessage,ApiError}
import services.artwork.objects.ArtworkTask
import services.artwork.objects.apiTypes.ArtworkTaskInput
import services.artwork.utils.{ArtworkEffects,ManifestRules}
final case class ProcessArtworkTaskMessage(ownerId: String, request: ArtworkTaskInput, providerConfigured: Boolean) extends APIMessage[ArtworkTask]:
  def plan(c: Connection): IO[ArtworkTask] = IO.realTime.map(_.toMillis).flatMap(now => IO.delay(UUID.randomUUID().toString).flatMap(token => ArtworkEffects.change(c,ownerId,request.projectId)(old => ManifestRules.claim(old,request.taskId,token,now,providerConfigured)))).flatMap(state => IO.fromOption(state.tasks.find(_.id == request.taskId))(ApiError("not_found","任务不存在",status=404)))
