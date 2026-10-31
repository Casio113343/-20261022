package services.generation.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
import services.library.objects.ResourceData
import services.artwork.objects.GeneratedImage
final case class GenerationOutput(data: ResourceData, image: Option[GeneratedImage])
object GenerationOutput:
  given Decoder[GenerationOutput] = deriveDecoder
  given Encoder[GenerationOutput] = deriveEncoder
