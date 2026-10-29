package services.conversations.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class Message(id: String, role: Role, content: String, createdAt: String)
object Message:
  given Encoder[Message] = deriveEncoder
  given Decoder[Message] = deriveDecoder
