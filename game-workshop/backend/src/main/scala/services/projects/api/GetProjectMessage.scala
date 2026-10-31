package services.projects.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.projects.objects.Project
import services.projects.tables.ProjectTable.ProjectTable
final case class GetProjectMessage(ownerId: String, projectId: String) extends APIMessage[Project]:
  def plan(c: Connection): IO[Project] = ProjectTable.find(c,ownerId,projectId)
