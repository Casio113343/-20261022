package services.artwork.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
final case class ArtworkRevision(id: String, slotId: String, originalAssetId: String, processedAssetId: String, originalHash: String, processedHash: String, parentRevisionId: Option[String], sourceProjectVersion: Int, provider: String, instruction: String, createdAt: String)
object ArtworkRevision:
  given Decoder[ArtworkRevision] = deriveDecoder
  given Encoder[ArtworkRevision] = deriveEncoder
