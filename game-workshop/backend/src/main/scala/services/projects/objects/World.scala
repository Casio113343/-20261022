package services.projects.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class World(background: String, conflict: String, rules: String, visual: String, preserve: String, freedom: String, images: List[ImageRef])
object World:
  given Decoder[World] = deriveDecoder
  given Encoder[World] = deriveEncoder
