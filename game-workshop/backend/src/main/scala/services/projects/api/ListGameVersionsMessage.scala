package services.projects.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.projects.objects.Project
import services.projects.tables.ProjectTable.ProjectTable
import services.projects.tables.GameVersionTable.GameVersionTable
final case class ListGameVersionsMessage(ownerId: String, projectId: String) extends APIMessage[List[Project]]:
  def plan(c: Connection): IO[List[Project]] = ProjectTable.find(c,ownerId,projectId) *> GameVersionTable.list(c,projectId)
