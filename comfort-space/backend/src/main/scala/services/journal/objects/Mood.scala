package services.journal.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}

final case class Mood(id: String, feeling: String, note: String, createdAt: String)
object Mood:
  given Encoder[Mood] = deriveEncoder
  given Decoder[Mood] = deriveDecoder
