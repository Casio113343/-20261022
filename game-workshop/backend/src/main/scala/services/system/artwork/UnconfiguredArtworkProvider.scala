package services.system.artwork
import cats.effect.IO
import services.artwork.objects.{ArtworkBrief,GeneratedImage}
import services.assets.objects.Asset
import services.system.api.ApiError
final class UnconfiguredArtworkProvider extends ArtworkProvider:
  val configured = false
  def generate(brief: ArtworkBrief, references: List[Asset]): IO[GeneratedImage] = IO.raiseError(ApiError("provider_not_configured","图片生成服务尚未配置",status=503))
  def edit(brief: ArtworkBrief, instruction: String, original: Asset, references: List[Asset]): IO[GeneratedImage] = IO.raiseError(ApiError("provider_not_configured","图片编辑服务尚未配置",status=503))
