package services.projects.objects
import io.circe.{Decoder, Encoder}
import io.circe.generic.semiauto.{deriveDecoder, deriveEncoder}
final case class DesignPlan(inputVersion: Int, source: GameInput, additions: List[PlanSection], unresolved: List[String], settings: RuntimeSettings, confirmed: Boolean, engine: String)
object DesignPlan:
  given Decoder[DesignPlan] = deriveDecoder
  given Encoder[DesignPlan] = deriveEncoder
