package services.generation.objects
import io.circe.{Decoder,Encoder}
import io.circe.generic.semiauto.{deriveDecoder,deriveEncoder}
import services.library.objects.ResourceVersion
final case class GenerationTask(id: String, input: GenerationInput, status: String, attempt: Int, leaseUntil: Long, candidate: Option[ResourceVersion], error: Option[String], savedResourceId: Option[String])
object GenerationTask:
  given Decoder[GenerationTask] = deriveDecoder
  given Encoder[GenerationTask] = deriveEncoder
