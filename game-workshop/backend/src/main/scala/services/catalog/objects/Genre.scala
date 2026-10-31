package services.catalog.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class Genre(id: String, family: String, name: String, description: String, controls: String, loop: String, victory: String, mechanics: List[String], prompt: String, support: String, scope: String)
object Genre:
  given Decoder[Genre] = deriveDecoder
  given Encoder[Genre] = deriveEncoder
