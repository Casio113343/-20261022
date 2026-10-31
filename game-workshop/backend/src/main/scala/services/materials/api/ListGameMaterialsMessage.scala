package services.materials.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.NoRequestMessage
import services.library.objects.CreativeResource
import services.library.api.ListResourcesMessage
final case class ListGameMaterialsMessage(ownerId: String) extends NoRequestMessage[List[CreativeResource]]:
  def plan(c: Connection): IO[List[CreativeResource]] = ListResourcesMessage(ownerId).plan(c).map(_.filter(_.history.lastOption.exists(_.data.kind == "asset")))
