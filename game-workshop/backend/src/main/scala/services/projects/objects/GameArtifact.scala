package services.projects.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class GameArtifact(id: String, projectId: String, version: Int, genreId: String, title: String, characters: List[Character], world: World, settings: RuntimeSettings, engine: String)
object GameArtifact:
  given Decoder[GameArtifact] = deriveDecoder
  given Encoder[GameArtifact] = deriveEncoder
