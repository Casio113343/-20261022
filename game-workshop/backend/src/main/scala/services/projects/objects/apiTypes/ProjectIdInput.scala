package services.projects.objects.apiTypes
import services.projects.objects.*
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
final case class ProjectIdInput(projectId: String)
object ProjectIdInput:
  given Decoder[ProjectIdInput] = deriveDecoder
