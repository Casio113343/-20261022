package services.system.artwork
import cats.effect.{IO,Resource}
import java.util.{Base64,UUID}
import java.io.{ByteArrayInputStream,ByteArrayOutputStream}
import java.awt.{RenderingHints,AlphaComposite}
import java.awt.image.BufferedImage
import javax.imageio.ImageIO
import java.security.MessageDigest
import services.assets.objects.Asset
import services.artwork.objects.{GeneratedImage,ProcessedArtwork}
import services.system.api.ApiError
object ImageProcessor:
  private def hash(bytes: Array[Byte]): String = java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes))
  def process(image: GeneratedImage, kind: String): IO[ProcessedArtwork] =
    if !Set("image/png","image/jpeg").contains(image.mime) || image.base64.length > 16777216 then IO.raiseError(ApiError("invalid_generated_image","生成图片格式或体积不符合要求"))
    else IO.blocking(Base64.getDecoder.decode(image.base64)).handleErrorWith(_ => IO.raiseError(ApiError("invalid_generated_image","生成图片编码无效"))).flatMap { bytes =>
      Resource.make(IO.blocking {
        val signature = if bytes.take(8).toList == List[Byte](-119,80,78,71,13,10,26,10) then "image/png" else if bytes.take(3).toList == List[Byte](-1,-40,-1) then "image/jpeg" else ""
        if signature != image.mime || bytes.length > 12582912 then throw ApiError("invalid_generated_image","生成图片签名或体积不符合要求")
        ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))
      })(stream => IO.blocking(stream.close())).use { stream =>
        Resource.make(IO.blocking {
          val readers = ImageIO.getImageReaders(stream)
          if !readers.hasNext then throw ApiError("invalid_generated_image","无法读取生成图片")
          val reader = readers.next()
          reader
        })(reader => IO.blocking(reader.dispose())).use { reader =>
          IO.blocking {
            reader.setInput(stream)
            val width = reader.getWidth(0)
            val height = reader.getHeight(0)
            if width <= 0 || height <= 0 || width > 4096 || height > 4096 then throw ApiError("invalid_generated_image","图片长宽须在1至4096像素之间")
            reader.read(0)
          }.flatMap { source =>
            val (width,height) = kind match
              case "scene" => (1024,683)
              case "card" => (384,576)
              case _ => (384,384)
            val target = new BufferedImage(width,height,BufferedImage.TYPE_INT_ARGB)
            Resource.make(IO.blocking(target.createGraphics()))(g => IO.blocking(g.dispose())).use { graphics => IO.blocking {
              graphics.setComposite(AlphaComposite.Src)
              graphics.setRenderingHint(RenderingHints.KEY_INTERPOLATION,RenderingHints.VALUE_INTERPOLATION_BICUBIC)
              val scale = math.min(width.toDouble/source.getWidth,height.toDouble/source.getHeight)
              val w = math.max(1,math.round(source.getWidth*scale).toInt)
              val h = math.max(1,math.round(source.getHeight*scale).toInt)
              val transform = java.awt.geom.AffineTransform.getTranslateInstance((width-w)/2.0,(height-h)/2.0)
              transform.scale(w.toDouble/source.getWidth,h.toDouble/source.getHeight)
              graphics.drawRenderedImage(source,transform)
            }} *> Resource.fromAutoCloseable(IO.blocking(new ByteArrayOutputStream())).use { output => IO.blocking {
              if !ImageIO.write(target,"png",output) then throw ApiError("image_processing_failed","PNG导出失败")
              val rendered = output.toByteArray
              ProcessedArtwork(Asset(UUID.randomUUID().toString,image.mime,image.base64),Asset(UUID.randomUUID().toString,"image/png",Base64.getEncoder.encodeToString(rendered)),hash(bytes),hash(rendered))
            }}
          }
        }
      }
    }
