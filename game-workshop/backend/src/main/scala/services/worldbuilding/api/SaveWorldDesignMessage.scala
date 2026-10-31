package services.worldbuilding.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.library.objects.CreativeResource
import services.library.objects.apiTypes.ResourceSaveInput
import services.library.api.SaveResourceMessage
final case class SaveWorldDesignMessage(ownerId: String, request: ResourceSaveInput) extends APIMessage[CreativeResource]:
  def plan(c: Connection): IO[CreativeResource] =
    IO.raiseWhen(request.data.kind != "world" || request.data.world.isEmpty)(ApiError("invalid_world","请填写世界观对应的成果内容，不能通过此接口保存其他类型")) *> SaveResourceMessage(ownerId,request).plan(c)
