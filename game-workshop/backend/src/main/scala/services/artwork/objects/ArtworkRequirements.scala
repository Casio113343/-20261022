package services.artwork.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
final case class ArtworkRequirements(projectId: String, projectVersion: Int, providerConfigured: Boolean, status: String, briefs: List[ArtworkBrief], limitations: List[String])
object ArtworkRequirements:
  given Decoder[ArtworkRequirements] = deriveDecoder
  given Encoder[ArtworkRequirements] = deriveEncoder
