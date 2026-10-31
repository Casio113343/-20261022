package services
import cats.effect.{IO,Ref}
import munit.CatsEffectSuite
import java.util.Base64
import java.security.MessageDigest
import java.io.ByteArrayInputStream
import javax.imageio.ImageIO
import services.system.artwork.ImageProcessor
import services.artwork.objects.{ArtworkBrief,GeneratedImage}
class ImageProcessorSuite extends CatsEffectSuite:
  test("加工保留原始字节和透明通道，输出按角色尺寸适配的PNG") {
    Ref.of[IO,List[String]](Nil).flatMap { calls =>
      TestArtworkProvider(calls,IO.unit).generate(ArtworkBrief("c","character","测试","",Nil,"1:1",0),Nil).flatMap { source =>
        ImageProcessor.process(source,"character").flatMap { result => IO.blocking {
          assertEquals(result.original.base64,source.base64)
          val sourceBytes = Base64.getDecoder.decode(source.base64)
          assertEquals(result.originalHash,java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(sourceBytes)))
          val output = ImageIO.read(new ByteArrayInputStream(Base64.getDecoder.decode(result.processed.base64)))
          assertEquals(output.getWidth,384)
          assertEquals(output.getHeight,384)
          assert(output.getColorModel.hasAlpha)
          assertEquals((output.getRGB(0,0) >>> 24) & 255,0)
          assertNotEquals(result.original.id,result.processed.id)
        }}
      }
    }
  }
  test("不把非法图片或错误MIME当作加工成功") {
    ImageProcessor.process(GeneratedImage("image/png","aGVsbG8=","test"),"scene").attempt.flatMap(first =>
      ImageProcessor.process(GeneratedImage("image/svg+xml","aA==","test"),"scene").attempt.map(second => { assert(first.isLeft); assert(second.isLeft) }))
  }
