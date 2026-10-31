package services.library.objects.apiTypes
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
import services.library.objects.ResourceData
final case class ResourceSaveInput(resourceId: String, expectedVersion: Int, data: ResourceData)
object ResourceSaveInput:
  given Decoder[ResourceSaveInput] = deriveDecoder
  given Encoder[ResourceSaveInput] = deriveEncoder
