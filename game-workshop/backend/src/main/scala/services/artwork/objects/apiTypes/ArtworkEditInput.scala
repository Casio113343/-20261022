package services.artwork.objects.apiTypes
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
final case class ArtworkEditInput(projectId: String, expectedVersion: Int, expectedManifestRevision: Int, requestId: String, slotIds: List[String], instruction: String)
object ArtworkEditInput:
  given Decoder[ArtworkEditInput] = deriveDecoder
