package services.artwork.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
final case class ArtworkManifest(projectId: String, revision: Int, slots: List[ArtworkSlot], tasks: List[ArtworkTask], history: List[ArtworkRevision])
object ArtworkManifest:
  given Decoder[ArtworkManifest] = deriveDecoder
  given Encoder[ArtworkManifest] = deriveEncoder
