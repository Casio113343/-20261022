package services.identity.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class Preferences(nickname: String, remember: Boolean, reducedMotion: Boolean)
object Preferences:
  given Encoder[Preferences] = deriveEncoder
  given Decoder[Preferences] = deriveDecoder
