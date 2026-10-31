package services.skills.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.library.objects.CreativeResource
import services.library.objects.apiTypes.ResourceSaveInput
import services.library.api.SaveResourceMessage
final case class SaveSkillDesignMessage(ownerId: String, request: ResourceSaveInput) extends APIMessage[CreativeResource]:
  def plan(c: Connection): IO[CreativeResource] =
    IO.raiseWhen(request.data.kind != "skill" || request.data.content.trim.isEmpty)(ApiError("invalid_skill","请填写技能与卡牌对应的成果内容，不能通过此接口保存其他类型")) *> SaveResourceMessage(ownerId,request).plan(c)
