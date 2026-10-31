package services.artwork.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
final case class GeneratedImage(mime: String, base64: String, provider: String)
object GeneratedImage:
  given Decoder[GeneratedImage] = deriveDecoder
  given Encoder[GeneratedImage] = deriveEncoder
