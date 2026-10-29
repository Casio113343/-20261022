package services.conversations.objects
import io.circe.{Decoder, Encoder}
enum Role:
  case User, Assistant
object Role:
  def toString(value: Role): String = value match
    case Role.User      => "user"
    case Role.Assistant => "assistant"
  def fromString(value: String): Either[String, Role] = value match
    case "user"      => Right(Role.User)
    case "assistant" => Right(Role.Assistant)
    case _           => Left("Invalid Role")
  given Encoder[Role] = Encoder.encodeString.contramap(toString)
  given Decoder[Role] = Decoder.decodeString.emap(fromString)
