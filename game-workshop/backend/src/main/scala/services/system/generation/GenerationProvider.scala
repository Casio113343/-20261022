package services.system.generation
import cats.effect.IO
import services.generation.objects.*
import services.assets.objects.Asset
trait GenerationProvider:
  def configured: Boolean
  def generate(input: GenerationInput, references: List[Asset], original: Option[Asset]): IO[GenerationOutput]
