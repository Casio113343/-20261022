package services.system.objects.apiTypes
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class Acknowledgement(ok: Boolean)
object Acknowledgement:
  given Encoder[Acknowledgement] = deriveEncoder
  given Decoder[Acknowledgement] = deriveDecoder
