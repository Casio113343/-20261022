package services.artwork.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
final case class ArtworkBinding(slotId: String, revisionId: String, originalAssetId: String, processedAssetId: String, originalHash: String, processedHash: String)
object ArtworkBinding:
  given Decoder[ArtworkBinding] = deriveDecoder
  given Encoder[ArtworkBinding] = deriveEncoder
