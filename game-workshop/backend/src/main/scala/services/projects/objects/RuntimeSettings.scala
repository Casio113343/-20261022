package services.projects.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class RuntimeSettings(difficulty: Int, rounds: Int)
object RuntimeSettings:
  given Decoder[RuntimeSettings] = deriveDecoder
  given Encoder[RuntimeSettings] = deriveEncoder
