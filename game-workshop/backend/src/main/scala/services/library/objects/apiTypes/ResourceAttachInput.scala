package services.library.objects.apiTypes
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}

final case class ResourceAttachInput(projectId: String, expectedVersion: Int, resourceId: String, resourceVersion: Int, target: String, expectedManifestRevision: Int)
object ResourceAttachInput:
  given Decoder[ResourceAttachInput] = deriveDecoder
  given Encoder[ResourceAttachInput] = deriveEncoder
