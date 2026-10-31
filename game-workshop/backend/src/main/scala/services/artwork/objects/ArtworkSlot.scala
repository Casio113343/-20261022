package services.artwork.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
final case class ArtworkSlot(id: String, kind: String, subject: String, brief: ArtworkBrief, currentRevisionId: Option[String], active: Boolean)
object ArtworkSlot:
  given Decoder[ArtworkSlot] = deriveDecoder
  given Encoder[ArtworkSlot] = deriveEncoder
