package services.projects.objects.apiTypes
import services.projects.objects.*
import io.circe.Decoder
import io.circe.generic.semiauto.deriveDecoder
final case class RevisePlanInput(projectId: String, expectedVersion: Int, additions: List[PlanSection], settings: RuntimeSettings)
object RevisePlanInput:
  given Decoder[RevisePlanInput] = deriveDecoder
