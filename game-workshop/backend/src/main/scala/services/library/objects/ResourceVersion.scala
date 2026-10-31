package services.library.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
import services.artwork.objects.ArtworkRevision
final case class ResourceVersion(version: Int, data: ResourceData, artwork: Option[ArtworkRevision], artworkKind: Option[String], createdAt: String)
object ResourceVersion:
  given Decoder[ResourceVersion] = deriveDecoder
  given Encoder[ResourceVersion] = deriveEncoder
