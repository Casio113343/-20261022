package services.conversations.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

import services.routing.objects.Direction
final case class Conversation(
    id: String,
    title: String,
    createdAt: String,
    updatedAt: String,
    messages: Vector[Message],
    direction: Option[Direction],
    revision: Long
)
object Conversation:
  given Encoder[Conversation] = deriveEncoder
  given Decoder[Conversation] = deriveDecoder
