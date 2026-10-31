package services.projects.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class Project(id: String, ownerId: String, version: Int, input: GameInput, plan: Option[DesignPlan], artifact: Option[GameArtifact], updatedAt: String)
object Project:
  given Decoder[Project] = deriveDecoder
  given Encoder[Project] = deriveEncoder
