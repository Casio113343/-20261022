package services.library.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.projects.tables.ProjectTable.ProjectTable
import services.library.tables.ProjectResourceTable.ProjectResourceTable
import services.library.objects.ResourceLink
final case class ListProjectResourcesMessage(ownerId: String, projectId: String) extends APIMessage[List[ResourceLink]]:
  def plan(c: Connection): IO[List[ResourceLink]] = ProjectTable.find(c,ownerId,projectId) *> ProjectResourceTable.list(c,projectId)
