package services.projects.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.system.api.APIMessage
import services.projects.objects.Project
import services.projects.objects.apiTypes.ProjectVersionInput
import services.projects.utils.{ProjectRules,ProjectEffects}
final case class GenerateGameMessage(ownerId: String, request: ProjectVersionInput) extends APIMessage[Project]:
  def plan(c: Connection): IO[Project] = IO.delay(UUID.randomUUID().toString).flatMap(id => ProjectEffects.change(c,ownerId,request.projectId)((p,t) => ProjectRules.generate(p,request.expectedVersion,t,id)))
