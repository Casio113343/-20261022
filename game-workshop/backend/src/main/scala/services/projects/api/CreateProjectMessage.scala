package services.projects.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.system.api.{APIMessage,ApiError}
import services.projects.objects.*
import services.projects.objects.apiTypes.CreateProjectInput
import services.projects.tables.ProjectTable.ProjectTable
import services.projects.utils.{ProjectRules,ProjectEffects}
final case class CreateProjectMessage(ownerId: String, request: CreateProjectInput) extends APIMessage[Project]:
  def plan(c: Connection): IO[Project] =
    IO.raiseWhen(request.requestId.isEmpty || request.requestId.length > 80)(ApiError("request_id","请求标识无效")) *> IO.fromEither(ProjectRules.validate(request.input,false)) *> ProjectEffects.validateAssets(c,ownerId,request.input) *> IO.realTimeInstant.flatMap(now => IO.delay(UUID.randomUUID().toString).flatMap { id =>
      val p = Project(id,ownerId,0,request.input,None,None,now.toString)
      ProjectTable.insert(c,request.requestId,p) *> ProjectTable.findRequest(c,ownerId,request.requestId).flatMap(_.fold(IO.raiseError[Project](ApiError("create_failed","创建失败")))(saved => if saved.input == request.input then IO.pure(saved) else IO.raiseError(ApiError("request_conflict","相同请求标识已用于不同内容",status=409))))
    })
