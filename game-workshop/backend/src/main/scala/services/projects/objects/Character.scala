package services.projects.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class Character(id: String, name: String, identity: String, faction: String, background: String, personality: String, catchphrase: String, relationships: String, skills: String, role: String, preserve: String, freedom: String, images: List[ImageRef])
object Character:
  given Decoder[Character] = deriveDecoder
  given Encoder[Character] = deriveEncoder
