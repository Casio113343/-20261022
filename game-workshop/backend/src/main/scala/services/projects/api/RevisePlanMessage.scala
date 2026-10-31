package services.projects.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.projects.objects.Project
import services.projects.objects.apiTypes.RevisePlanInput
import services.projects.utils.{ProjectRules,ProjectEffects}
final case class RevisePlanMessage(ownerId: String, request: RevisePlanInput) extends APIMessage[Project]:
  def plan(c: Connection): IO[Project] = ProjectEffects.change(c,ownerId,request.projectId)((p,t) => ProjectRules.revise(p,request.expectedVersion,request.additions,request.settings,t))
