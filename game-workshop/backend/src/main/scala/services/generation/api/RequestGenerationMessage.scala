package services.generation.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.generation.objects.*
import services.generation.tables.GenerationTable.GenerationTable
import services.library.api.SaveResourceMessage
import services.assets.tables.AssetTable.AssetTable
import cats.syntax.all.*
final case class RequestGenerationMessage(ownerId: String, kind: String, request: GenerationInput) extends APIMessage[GenerationTask]:
  def plan(c: Connection): IO[GenerationTask] =
    val refs = request.data.world.toList.flatMap(_.images) ++ request.data.character.toList.flatMap(_.images)
    IO.raiseWhen(request.data.kind != kind || request.requestId.trim.isEmpty || request.requestId.length > 80 || request.instruction.trim.isEmpty || request.instruction.length > 6000 || request.data.title.length > 120 || request.data.content.length > 6000 || request.data.description.length > 6000 || !Set("scene","character","card","icon","tower").contains(request.imageKind) || refs.size > 9)(ApiError("invalid_generation","生成类型、请求标识、图片用途或创作要求无效")) *>
    IO.raiseWhen(Set("asset","edit").contains(kind) && !request.generateImage)(ApiError("image_required","素材与图片修改必须生成图片")) *>
    IO.raiseWhen(kind == "edit" && request.data.source.isEmpty)(ApiError("original_required","图片修改必须选择已有生成原图")) *>
    refs.traverse_(i => AssetTable.find(c,ownerId,i.assetId).flatMap(a => IO.raiseWhen(a.isEmpty)(ApiError("asset_missing","参考图不存在或无权使用")))) *>
    request.data.source.traverse_(s => services.artwork.api.GetArtworkManifestMessage(ownerId,s.projectId).plan(c).flatMap(m => IO.raiseUnless(m.history.exists(_.id == s.revisionId))(ApiError("artwork_missing","原图版本不存在")))) *>
    GenerationTable.insert(c,ownerId,GenerationTask(request.requestId,request,"pending",0,0L,None,None,None)) *>
    GenerationTable.find(c,ownerId,request.requestId).flatMap(t => IO.fromOption(t)(ApiError("not_found","任务不存在",status=404))).flatMap(t => if t.input == request then IO.pure(t) else IO.raiseError(ApiError("request_conflict","同一请求标识已用于其他生成内容",status=409)))
