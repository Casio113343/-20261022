package services.library.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
import services.projects.objects.{World,Character}
final case class ResourceData(kind: String, title: String, description: String, content: String, world: Option[World], character: Option[Character], source: Option[ResourceSource])
object ResourceData:
  given Decoder[ResourceData] = deriveDecoder
  given Encoder[ResourceData] = deriveEncoder
