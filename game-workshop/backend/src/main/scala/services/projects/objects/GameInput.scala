package services.projects.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class GameInput(title: String, genreId: String, reference: String, mechanics: String, requirements: String, world: World, characters: List[Character])
object GameInput:
  given Decoder[GameInput] = deriveDecoder
  given Encoder[GameInput] = deriveEncoder
