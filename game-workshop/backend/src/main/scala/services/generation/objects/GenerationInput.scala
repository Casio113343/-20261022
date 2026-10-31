package services.generation.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
import services.library.objects.ResourceData
final case class GenerationInput(requestId: String, data: ResourceData, instruction: String, imageKind: String, generateImage: Boolean)
object GenerationInput:
  given Decoder[GenerationInput] = deriveDecoder
  given Encoder[GenerationInput] = deriveEncoder
