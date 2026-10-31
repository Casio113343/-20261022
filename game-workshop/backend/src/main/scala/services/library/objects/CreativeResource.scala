package services.library.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}

final case class CreativeResource(id: String, version: Int, history: List[ResourceVersion])
object CreativeResource:
  given Decoder[CreativeResource] = deriveDecoder
  given Encoder[CreativeResource] = deriveEncoder
