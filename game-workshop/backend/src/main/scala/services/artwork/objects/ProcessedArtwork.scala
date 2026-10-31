package services.artwork.objects
import services.assets.objects.Asset
final case class ProcessedArtwork(original: Asset, processed: Asset, originalHash: String, processedHash: String)
object ProcessedArtwork:
  given io.circe.Decoder[ProcessedArtwork] = io.circe.generic.semiauto.deriveDecoder
  given io.circe.Encoder[ProcessedArtwork] = io.circe.generic.semiauto.deriveEncoder
