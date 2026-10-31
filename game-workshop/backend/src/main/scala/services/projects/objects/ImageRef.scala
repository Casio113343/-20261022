package services.projects.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class ImageRef(assetId: String, purpose: String)
object ImageRef:
  given Decoder[ImageRef] = deriveDecoder
  given Encoder[ImageRef] = deriveEncoder
