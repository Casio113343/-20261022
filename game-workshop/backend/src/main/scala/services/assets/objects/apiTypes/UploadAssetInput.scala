package services.assets.objects.apiTypes
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
final case class UploadAssetInput(mime: String, base64: String)
object UploadAssetInput:
  given Decoder[UploadAssetInput] = deriveDecoder
