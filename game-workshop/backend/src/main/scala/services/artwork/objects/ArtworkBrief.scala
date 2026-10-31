package services.artwork.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
final case class ArtworkBrief(slotId: String, kind: String, subject: String, prompt: String, referenceAssetIds: List[String], aspectRatio: String, projectVersion: Int)
object ArtworkBrief:
  given Decoder[ArtworkBrief] = deriveDecoder
  given Encoder[ArtworkBrief] = deriveEncoder
