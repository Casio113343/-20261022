package services.identity.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class Session(ownerId: String, token: String)
object Session:
  given Decoder[Session] = deriveDecoder
  given Encoder[Session] = deriveEncoder
