package services.projects.objects.apiTypes
import services.projects.objects.*
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
final case class ProjectVersionInput(projectId: String, expectedVersion: Int)
object ProjectVersionInput:
  given Decoder[ProjectVersionInput] = deriveDecoder
