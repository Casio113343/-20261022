package services.assets.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.assets.objects.Asset
import services.assets.tables.AssetTable.AssetTable
final case class GetAssetMessage(ownerId: String, assetId: String) extends APIMessage[Asset]:
  def plan(c: Connection): IO[Asset] = AssetTable.find(c,ownerId,assetId).flatMap(_.fold(IO.raiseError[Asset](ApiError("not_found","图片不存在",status=404)))(IO.pure))
