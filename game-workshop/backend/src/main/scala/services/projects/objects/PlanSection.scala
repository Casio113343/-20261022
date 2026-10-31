package services.projects.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class PlanSection(title: String, content: String)
object PlanSection:
  given Decoder[PlanSection] = deriveDecoder
  given Encoder[PlanSection] = deriveEncoder
