package services.assets.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class Asset(id: String, mime: String, base64: String)
object Asset:
  given Decoder[Asset] = deriveDecoder
  given Encoder[Asset] = deriveEncoder
