package services.library.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.NoRequestMessage
import services.library.objects.CreativeResource
import services.library.tables.ResourceTable.ResourceTable
final case class ListResourcesMessage(ownerId: String) extends NoRequestMessage[List[CreativeResource]]:
  def plan(c: Connection): IO[List[CreativeResource]] = ResourceTable.list(c,ownerId)
