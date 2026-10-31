package services.projects.objects
import io.circe.{Decoder, Encoder, Json}
import services.artwork.objects.ArtworkBinding
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class GameArtifact(id: String, projectId: String, version: Int, genreId: String, title: String, characters: List[Character], world: World, settings: RuntimeSettings, engine: String, artworkBindings: List[ArtworkBinding] = Nil)
object GameArtifact:
  given Decoder[GameArtifact] = deriveDecoder[GameArtifact].prepare(_.withFocus(_.mapObject(obj => if obj.contains("artworkBindings") then obj else obj.add("artworkBindings",Json.arr()))))
  given Encoder[GameArtifact] = deriveEncoder
