package services.artwork.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.projects.objects.apiTypes.ProjectVersionInput
import services.projects.tables.ProjectTable.ProjectTable
import services.artwork.objects.ArtworkRequirements
import services.artwork.utils.ArtworkRules
final case class GetArtworkRequirementsMessage(ownerId: String, request: ProjectVersionInput) extends APIMessage[ArtworkRequirements]:
  def plan(c: Connection): IO[ArtworkRequirements] = ProjectTable.find(c,ownerId,request.projectId).flatMap(p => IO.fromEither(ArtworkRules.build(p,request.expectedVersion)))
