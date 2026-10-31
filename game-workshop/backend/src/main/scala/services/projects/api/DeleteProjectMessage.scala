package services.projects.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.projects.tables.ProjectTable.ProjectTable
final case class DeleteProjectMessage(ownerId: String, projectId: String) extends APIMessage[Boolean]:
  def plan(c: Connection): IO[Boolean] = ProjectTable.find(c,ownerId,projectId) *> ProjectTable.delete(c,ownerId,projectId).as(true)
