package services.characters.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.library.objects.CreativeResource
import services.library.objects.apiTypes.ResourceSaveInput
import services.library.api.SaveResourceMessage
final case class SaveCharacterDesignMessage(ownerId: String, request: ResourceSaveInput) extends APIMessage[CreativeResource]:
  def plan(c: Connection): IO[CreativeResource] =
    IO.raiseWhen(request.data.kind != "character" || request.data.character.isEmpty)(ApiError("invalid_character","请填写角色设计对应的成果内容，不能通过此接口保存其他类型")) *> SaveResourceMessage(ownerId,request).plan(c)
