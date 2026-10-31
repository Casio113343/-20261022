package services.artwork.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.projects.tables.ProjectTable.ProjectTable
import services.artwork.objects.ArtworkManifest
import services.artwork.objects.apiTypes.ArtworkEditInput
import services.artwork.utils.{ArtworkEffects,ManifestRules}
final case class RequestArtworkEditMessage(ownerId: String, request: ArtworkEditInput) extends APIMessage[ArtworkManifest]:
  def plan(c: Connection): IO[ArtworkManifest] = ProjectTable.find(c,ownerId,request.projectId).flatMap(p => IO.raiseUnless(p.version == request.expectedVersion)(ApiError("version_conflict","资料已更新",status=409))) *> ArtworkEffects.change(c,ownerId,request.projectId)(old => ManifestRules.edit(old,request.expectedManifestRevision,request.requestId,request.slotIds,request.instruction))
