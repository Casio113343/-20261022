package services.generation.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.generation.objects.AcceptGenerationInput
import services.generation.tables.GenerationTable.GenerationTable
import services.library.objects.*
import services.library.objects.apiTypes.ResourceSaveInput
import services.library.tables.ResourceTable.ResourceTable
import services.library.api.{SaveResourceMessage,GetResourceMessage}
final case class AcceptGenerationMessage(ownerId: String, request: AcceptGenerationInput) extends APIMessage[CreativeResource]:
  def plan(c: Connection): IO[CreativeResource] = GetGenerationMessage(ownerId,request.taskId).plan(c).flatMap { t =>
    t.savedResourceId match
      case Some(id) => if id == request.resourceId then GetResourceMessage(ownerId,id).plan(c) else IO.raiseError(ApiError("already_saved","该结果已保存至其他资源",status=409))
      case None => IO.raiseUnless(t.status == "succeeded")(ApiError("generation_incomplete","生成尚未成功",status=409)) *> IO.fromOption(t.candidate)(ApiError("candidate_missing","没有可审阅结果")).flatMap { v =>
        SaveResourceMessage(ownerId,ResourceSaveInput(request.resourceId,request.expectedVersion,v.data.copy(source=None))).plan(c).flatMap { saved =>
          val pinned = v.copy(version=saved.version)
          val result = saved.copy(history=saved.history.dropRight(1) :+ pinned)
          ResourceTable.save(c,ownerId,saved.version,result) *> GenerationTable.save(c,ownerId,t.copy(savedResourceId=Some(result.id))).as(result)
        }
      }
  }
