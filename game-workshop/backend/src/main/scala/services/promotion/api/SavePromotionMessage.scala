package services.promotion.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.library.objects.CreativeResource
import services.library.objects.apiTypes.ResourceSaveInput
import services.library.api.SaveResourceMessage
final case class SavePromotionMessage(ownerId: String, request: ResourceSaveInput) extends APIMessage[CreativeResource]:
  def plan(c: Connection): IO[CreativeResource] =
    IO.raiseWhen(request.data.kind != "promo" || request.data.description.trim.isEmpty && request.data.content.trim.isEmpty)(ApiError("invalid_promo","请填写宣传物料对应的成果内容，不能通过此接口保存其他类型")) *> SaveResourceMessage(ownerId,request).plan(c)
