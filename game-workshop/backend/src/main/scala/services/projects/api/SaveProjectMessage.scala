package services.projects.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.projects.objects.Project
import services.projects.objects.apiTypes.SaveProjectInput
import services.projects.utils.{ProjectRules,ProjectEffects}
final case class SaveProjectMessage(ownerId: String, request: SaveProjectInput) extends APIMessage[Project]:
  def plan(c: Connection): IO[Project] = IO.fromEither(ProjectRules.validate(request.input,false)) *> ProjectEffects.validateAssets(c,ownerId,request.input) *> ProjectEffects.change(c,ownerId,request.projectId)((p,t) => ProjectRules.save(p,request.expectedVersion,request.input,t))
