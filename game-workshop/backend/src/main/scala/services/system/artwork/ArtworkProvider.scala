package services.system.artwork
import cats.effect.IO
import services.artwork.objects.{ArtworkBrief,GeneratedImage}
import services.assets.objects.Asset
trait ArtworkProvider:
  def configured: Boolean
  def generate(brief: ArtworkBrief, references: List[Asset]): IO[GeneratedImage]
  def edit(brief: ArtworkBrief, instruction: String, original: Asset, references: List[Asset]): IO[GeneratedImage]
