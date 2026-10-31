package services.library.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.library.objects.CreativeResource
import services.library.tables.ResourceTable.ResourceTable
final case class GetResourceMessage(ownerId: String, resourceId: String) extends APIMessage[CreativeResource]:
  def plan(c: Connection): IO[CreativeResource] = ResourceTable.find(c,ownerId,resourceId).flatMap(IO.fromOption(_)(ApiError("not_found","资源不存在或无权访问",status=404)))
