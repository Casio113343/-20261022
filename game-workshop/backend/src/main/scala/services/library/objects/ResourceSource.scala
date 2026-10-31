package services.library.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}

final case class ResourceSource(projectId: String, revisionId: String)
object ResourceSource:
  given Decoder[ResourceSource] = deriveDecoder
  given Encoder[ResourceSource] = deriveEncoder
