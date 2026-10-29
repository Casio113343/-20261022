package services.conversations.objects.apiTypes
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class SendMessageInput(
    conversationId: java.util.UUID,
    requestId: java.util.UUID,
    content: String
)
object SendMessageInput:
  given Decoder[SendMessageInput] = deriveDecoder
  given Encoder[SendMessageInput] = deriveEncoder
