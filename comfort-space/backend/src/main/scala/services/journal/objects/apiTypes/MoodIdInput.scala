package services.journal.objects.apiTypes
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class MoodIdInput(id: java.util.UUID)
object MoodIdInput:
  given Decoder[MoodIdInput] = deriveDecoder
  given Encoder[MoodIdInput] = deriveEncoder
