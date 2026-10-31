package services.artwork.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.projects.tables.ProjectTable.ProjectTable
import services.artwork.tables.ArtworkTable.ArtworkTable
import services.artwork.objects.ArtworkManifest
import services.artwork.objects.apiTypes.ArtworkPlanInput
import services.artwork.utils.ManifestRules
final case class PrepareArtworkMessage(ownerId: String, request: ArtworkPlanInput) extends APIMessage[ArtworkManifest]:
  def plan(c: Connection): IO[ArtworkManifest] = ProjectTable.find(c,ownerId,request.projectId).flatMap(p => ArtworkTable.find(c,p.id).flatMap(old => IO.fromEither(ManifestRules.synchronize(p,request.expectedVersion,old)).flatMap(next => if next == old then IO.pure(old) else ArtworkTable.save(c,old.revision,next))))
