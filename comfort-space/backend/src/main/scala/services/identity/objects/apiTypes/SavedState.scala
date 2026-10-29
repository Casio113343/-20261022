package services.identity.objects.apiTypes
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
import services.conversations.objects.Conversation
import services.journal.objects.Mood
import services.identity.objects.Preferences
final case class SavedState(
    version: Int,
    conversations: Vector[Conversation],
    favourites: Vector[String],
    moods: Vector[Mood],
    preferences: Preferences
)
object SavedState:
  given Encoder[SavedState] = deriveEncoder
  given Decoder[SavedState] = deriveDecoder
