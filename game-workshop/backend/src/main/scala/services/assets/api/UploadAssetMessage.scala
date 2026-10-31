package services.assets.api
import cats.effect.{IO,Resource}
import cats.syntax.all.*
import java.sql.Connection
import java.util.{Base64,UUID}
import javax.imageio.ImageIO
import java.io.ByteArrayInputStream
import services.system.api.{APIMessage,ApiError}
import services.assets.objects.Asset
import services.assets.objects.apiTypes.UploadAssetInput
import services.assets.tables.AssetTable.AssetTable
final case class UploadAssetMessage(ownerId: String, input: UploadAssetInput) extends APIMessage[Asset]:
  def plan(c: Connection): IO[Asset] =
    if input.base64.length > 2800000 || !Set("image/png","image/jpeg").contains(input.mime) then IO.raiseError(ApiError("image_invalid","只支持PNG/JPEG，每张不超过2MB"))
    else IO.blocking(Base64.getDecoder.decode(input.base64)).adaptError { case _: IllegalArgumentException => ApiError("image_invalid","图片编码无效") }.flatMap { bytes =>
      val validate = Resource.make(IO.blocking {
        val signature = if bytes.take(8).toList == List[Byte](-119,80,78,71,13,10,26,10) then "image/png" else if bytes.take(3).toList == List[Byte](-1,-40,-1) then "image/jpeg" else ""
        if bytes.length > 2097152 || signature != input.mime then throw ApiError("image_invalid","图片实际格式或体积不符合要求")
        ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))
      })(s => IO.blocking(s.close())).use { stream =>
        Resource.make(IO.blocking {
          val readers = ImageIO.getImageReaders(stream)
          if !readers.hasNext then throw ApiError("image_invalid","无法读取图片")
          readers.next()
        })(r => IO.blocking(r.dispose())).use(reader => IO.blocking {
          reader.setInput(stream)
          if reader.getWidth(0) > 4096 || reader.getHeight(0) > 4096 then throw ApiError("image_invalid","图片长宽均不能超过4096像素")
        })
      }
      validate *> IO.delay(UUID.randomUUID().toString).flatMap { id =>
        val asset = Asset(id,input.mime,input.base64)
        AssetTable.insert(c,ownerId,asset,bytes).as(asset)
      }
    }
