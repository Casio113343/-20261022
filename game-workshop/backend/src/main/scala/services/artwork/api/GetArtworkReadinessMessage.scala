package services.artwork.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.artwork.objects.{ArtworkReadiness,TaskStatus}
import services.artwork.utils.ManifestRules
final case class GetArtworkReadinessMessage(ownerId: String, projectId: String) extends APIMessage[ArtworkReadiness]:
  def plan(c: Connection): IO[ArtworkReadiness] = GetArtworkManifestMessage(ownerId,projectId).plan(c).map(state => ArtworkReadiness(state,ManifestRules.ready(state),ManifestRules.bindings(state),state.tasks.exists(t => t.status == TaskStatus.Failed && state.slots.exists(s => s.active && s.id == t.slotId))))
