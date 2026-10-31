package services.imageediting.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.library.objects.CreativeResource
import services.library.objects.apiTypes.ResourceSaveInput
import services.library.api.SaveResourceMessage
final case class SaveImageEditMessage(ownerId: String, request: ResourceSaveInput) extends APIMessage[CreativeResource]:
  def plan(c: Connection): IO[CreativeResource] =
    IO.raiseWhen(request.data.kind != "edit" || request.data.content.trim.isEmpty)(ApiError("invalid_edit","请填写图片修改对应的成果内容，不能通过此接口保存其他类型")) *> SaveResourceMessage(ownerId,request).plan(c)
