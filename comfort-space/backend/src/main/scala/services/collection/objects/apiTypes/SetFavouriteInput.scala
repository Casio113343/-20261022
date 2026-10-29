package services.collection.objects.apiTypes
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class SetFavouriteInput(id: String, saved: Boolean)
object SetFavouriteInput:
  given Decoder[SetFavouriteInput] = deriveDecoder
  given Encoder[SetFavouriteInput] = deriveEncoder
