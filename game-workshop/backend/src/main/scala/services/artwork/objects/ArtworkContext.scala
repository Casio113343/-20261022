package services.artwork.objects
import services.assets.objects.Asset
final case class ArtworkContext(references: List[Asset], original: Option[Asset])
object ArtworkContext:
  given io.circe.Decoder[ArtworkContext] = io.circe.generic.semiauto.deriveDecoder
  given io.circe.Encoder[ArtworkContext] = io.circe.generic.semiauto.deriveEncoder
