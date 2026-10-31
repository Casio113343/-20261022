package services.artwork.objects.apiTypes
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
final case class ArtworkPlanInput(projectId: String, expectedVersion: Int)
object ArtworkPlanInput:
  given Decoder[ArtworkPlanInput] = deriveDecoder
