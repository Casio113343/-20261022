package services
import cats.effect.{IO,Ref,Resource}
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import java.util.Base64
import javax.imageio.ImageIO
import services.system.artwork.ArtworkProvider
import services.artwork.objects.{ArtworkBrief,GeneratedImage}
import services.assets.objects.Asset
// 测试替身只在测试目录生成合成PNG，不作为真实模型或产品美术。
final case class TestArtworkProvider(calls: Ref[IO,List[String]], before: IO[Unit], failSlot: Option[String] = None) extends ArtworkProvider:
  val configured = true
  private def image(edit: Boolean): IO[GeneratedImage] = Resource.fromAutoCloseable(IO.blocking(new ByteArrayOutputStream())).use(output => IO.blocking {
    val image = new BufferedImage(16,16,BufferedImage.TYPE_INT_ARGB)
    image.setRGB(8,8,if edit then 0xffcc4444 else 0xff44cc88)
    ImageIO.write(image,"png",output)
    GeneratedImage("image/png",Base64.getEncoder.encodeToString(output.toByteArray),"test-only-provider")
  })
  def generate(brief: ArtworkBrief, references: List[Asset]): IO[GeneratedImage] = before *> calls.update(_ :+ s"generate:${brief.slotId}") *> (if failSlot.contains(brief.slotId) then IO.raiseError(new RuntimeException("测试注入失败")) else image(false))
  def edit(brief: ArtworkBrief, instruction: String, original: Asset, references: List[Asset]): IO[GeneratedImage] =
    IO.raiseWhen(original.base64.isEmpty || instruction.isEmpty)(new RuntimeException("缺少编辑原图或明确要求")) *> before *> calls.update(_ :+ s"edit:${brief.slotId}") *> image(true)
