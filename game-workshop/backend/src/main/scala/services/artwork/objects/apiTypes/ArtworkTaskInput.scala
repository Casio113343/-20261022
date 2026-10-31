package services.artwork.objects.apiTypes
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
final case class ArtworkTaskInput(projectId: String, taskId: String)
object ArtworkTaskInput:
  given Decoder[ArtworkTaskInput] = deriveDecoder
