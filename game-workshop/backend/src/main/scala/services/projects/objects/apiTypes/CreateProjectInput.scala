package services.projects.objects.apiTypes
import services.projects.objects.*
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
final case class CreateProjectInput(requestId: String, input: GameInput)
object CreateProjectInput:
  given Decoder[CreateProjectInput] = deriveDecoder
