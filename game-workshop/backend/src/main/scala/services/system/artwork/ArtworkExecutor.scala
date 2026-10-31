package services.system.artwork
import cats.effect.IO
import cats.syntax.all.*
import scala.concurrent.duration.*
import services.system.database.Database
import services.system.api.ApiError
import services.artwork.objects.*
import services.artwork.api.*
import services.artwork.objects.apiTypes.ArtworkTaskInput
final case class ArtworkExecutor(database: Database, provider: ArtworkProvider):
  def runPending(owner: String, projectId: String, state: ArtworkManifest): IO[Unit] =
    state.tasks.filter(t => Set(TaskStatus.Pending,TaskStatus.Blocked).contains(t.status)).traverse_ { task =>
      database.transaction(c => ProcessArtworkTaskMessage(owner,ArtworkTaskInput(projectId,task.id),provider.configured).plan(c)).flatMap(finish(owner,projectId,_)).void
    }
  private def failure(owner: String, projectId: String, task: ArtworkTask, token: String, reason: String): IO[ArtworkTask] = database.transaction(c => FailArtworkTaskMessage(owner,projectId,task.id,token,reason).plan(c))
  // 事务计划和模型交互分阶段组合；外部调用不占用数据库连接。
  def finish(owner: String, projectId: String, task: ArtworkTask): IO[ArtworkTask] =
    if task.status != TaskStatus.Running then IO.pure(task)
    else IO.fromOption(task.leaseToken)(ApiError("task_token_missing","任务缺少执行凭据")).flatMap { token =>
      val work = database.transaction(c => GetArtworkContextMessage(owner,projectId,task.id,token).plan(c)).flatMap { context =>
        if task.operation == "edit" then IO.fromOption(context.original)(ApiError("original_missing","局部编辑需要原图")).flatMap(image => provider.edit(task.brief,task.instruction,image,context.references))
        else provider.generate(task.brief,context.references)
      }.flatMap(image => ImageProcessor.process(image,task.brief.kind).map(processed => (image.provider,processed))).flatMap { case (providerName,processed) =>
        database.transaction(c => CompleteArtworkTaskMessage(owner,projectId,task.id,token,processed,providerName).plan(c))
      }
      work.timeoutTo(90.seconds,IO.raiseError(ApiError("artwork_timeout","图片服务处理超时"))).handleErrorWith {
        case e: ApiError => failure(owner,projectId,task,token,e.code)
        case _ => failure(owner,projectId,task,token,"provider_or_processing_failed")
      }.onCancel(failure(owner,projectId,task,token,"request_cancelled").void)
    }
