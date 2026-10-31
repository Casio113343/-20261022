package services.library.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}

final case class ResourceLink(resourceId: String, version: Int, target: String, title: String)
object ResourceLink:
  given Decoder[ResourceLink] = deriveDecoder
  given Encoder[ResourceLink] = deriveEncoder
