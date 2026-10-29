package services.identity.objects.apiTypes
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class UpdatePreferencesInput(preferences: services.identity.objects.Preferences)
object UpdatePreferencesInput:
  given Decoder[UpdatePreferencesInput] = deriveDecoder
  given Encoder[UpdatePreferencesInput] = deriveEncoder
