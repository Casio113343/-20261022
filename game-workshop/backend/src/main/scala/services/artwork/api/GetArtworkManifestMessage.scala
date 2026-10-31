package services.artwork.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.projects.tables.ProjectTable.ProjectTable
import services.artwork.tables.ArtworkTable.ArtworkTable
import services.artwork.objects.ArtworkManifest
final case class GetArtworkManifestMessage(ownerId: String, projectId: String) extends APIMessage[ArtworkManifest]:
  def plan(c: Connection): IO[ArtworkManifest] = ProjectTable.find(c,ownerId,projectId) *> ArtworkTable.find(c,projectId)
