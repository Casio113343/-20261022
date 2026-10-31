package services.projects.objects.apiTypes
import services.projects.objects.*
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
final case class SaveProjectInput(projectId: String, expectedVersion: Int, input: GameInput)
object SaveProjectInput:
  given Decoder[SaveProjectInput] = deriveDecoder
