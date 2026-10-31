package services.generation.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}

final case class AcceptGenerationInput(taskId: String, resourceId: String, expectedVersion: Int)
object AcceptGenerationInput:
  given Decoder[AcceptGenerationInput] = deriveDecoder
  given Encoder[AcceptGenerationInput] = deriveEncoder
