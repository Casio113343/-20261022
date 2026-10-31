package services.artwork.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.artwork.objects.ArtworkManifest
import services.artwork.objects.apiTypes.ArtworkTaskInput
import services.artwork.utils.{ArtworkEffects,ManifestRules}
final case class RetryArtworkTaskMessage(ownerId: String, request: ArtworkTaskInput) extends APIMessage[ArtworkManifest]:
  def plan(c: Connection): IO[ArtworkManifest] = IO.realTime.map(_.toMillis).flatMap(now => ArtworkEffects.change(c,ownerId,request.projectId)(old => ManifestRules.retry(old,request.taskId,now)))
