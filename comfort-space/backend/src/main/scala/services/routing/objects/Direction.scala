package services.routing.objects
import io.circe.{Decoder, Encoder}
enum Direction:
  case Study, Relationships, Self, Loneliness, Change
object Direction:
  def toString(value: Direction): String = value match
    case Direction.Study         => "study"
    case Direction.Relationships => "relationships"
    case Direction.Self          => "self"
    case Direction.Loneliness    => "loneliness"
    case Direction.Change        => "change"
  def fromString(value: String): Either[String, Direction] = value match
    case "study"         => Right(Direction.Study)
    case "relationships" => Right(Direction.Relationships)
    case "self"          => Right(Direction.Self)
    case "loneliness"    => Right(Direction.Loneliness)
    case "change"        => Right(Direction.Change)
    case _               => Left("Invalid Direction")
  given Encoder[Direction] = Encoder.encodeString.contramap(toString)
  given Decoder[Direction] = Decoder.decodeString.emap(fromString)
