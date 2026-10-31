package services.artwork.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
final case class ArtworkTask(id: String, slotId: String, operation: String, instruction: String, brief: ArtworkBrief, baseRevisionId: Option[String], requestId: String, status: TaskStatus, attempts: Int, leaseToken: Option[String], leaseUntil: Long, error: Option[String])
object ArtworkTask:
  given Decoder[ArtworkTask] = deriveDecoder
  given Encoder[ArtworkTask] = deriveEncoder
