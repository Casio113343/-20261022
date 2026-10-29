package services.conversations.objects.apiTypes
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class ConversationIdInput(id: java.util.UUID)
object ConversationIdInput:
  given Decoder[ConversationIdInput] = deriveDecoder
  given Encoder[ConversationIdInput] = deriveEncoder
