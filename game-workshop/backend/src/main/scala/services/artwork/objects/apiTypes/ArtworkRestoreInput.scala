package services.artwork.objects.apiTypes
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
final case class ArtworkRestoreInput(projectId: String, expectedVersion: Int, expectedManifestRevision: Int, revisionId: String)
object ArtworkRestoreInput:
  given Decoder[ArtworkRestoreInput] = deriveDecoder
