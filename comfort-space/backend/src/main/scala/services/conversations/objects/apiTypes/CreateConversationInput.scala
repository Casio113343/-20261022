package services.conversations.objects.apiTypes
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class CreateConversationInput(id: java.util.UUID)
object CreateConversationInput:
  given Decoder[CreateConversationInput] = deriveDecoder
  given Encoder[CreateConversationInput] = deriveEncoder
