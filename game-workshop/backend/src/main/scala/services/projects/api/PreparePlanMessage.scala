package services.projects.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.projects.objects.Project
import services.projects.objects.apiTypes.ProjectVersionInput
import services.projects.utils.{ProjectRules,ProjectEffects}
final case class PreparePlanMessage(ownerId: String, request: ProjectVersionInput) extends APIMessage[Project]:
  def plan(c: Connection): IO[Project] = ProjectEffects.change(c,ownerId,request.projectId)((p,t) => ProjectRules.prepare(p,request.expectedVersion,t))
