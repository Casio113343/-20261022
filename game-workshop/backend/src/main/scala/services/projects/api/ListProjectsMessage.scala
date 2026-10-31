package services.projects.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.projects.objects.Project
import services.projects.tables.ProjectTable.ProjectTable
final case class ListProjectsMessage(ownerId: String) extends APIMessage[List[Project]]:
  def plan(c: Connection): IO[List[Project]] = ProjectTable.list(c,ownerId)
