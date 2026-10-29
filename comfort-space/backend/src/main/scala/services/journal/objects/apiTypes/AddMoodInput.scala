package services.journal.objects.apiTypes
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class AddMoodInput(id: java.util.UUID, feeling: String, note: String)
object AddMoodInput:
  given Decoder[AddMoodInput] = deriveDecoder
  given Encoder[AddMoodInput] = deriveEncoder
