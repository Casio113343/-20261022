package services.projects.objects.apiTypes
import services.projects.objects.Project
import services.artwork.objects.ArtworkManifest
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
final case class GameBuildResult(status: String, project: Project, artwork: ArtworkManifest, message: String)
object GameBuildResult:
  given Encoder[GameBuildResult] = deriveEncoder
  given Decoder[GameBuildResult] = deriveDecoder
