package services.artwork.api
import cats.effect.IO
import cats.syntax.all.*
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.artwork.objects.ArtworkContext
import services.artwork.utils.ManifestRules
import services.assets.tables.AssetTable.AssetTable
final case class GetArtworkContextMessage(ownerId: String, projectId: String, taskId: String, token: String) extends APIMessage[ArtworkContext]:
  def plan(c: Connection): IO[ArtworkContext] = GetArtworkManifestMessage(ownerId,projectId).plan(c).flatMap { state =>
    IO.raiseUnless(ManifestRules.accepts(state,taskId,token))(ApiError("stale_artwork_result","任务已变化",status=409)) *>
      IO.fromOption(state.tasks.find(_.id == taskId))(ApiError("not_found","任务不存在",status=404)).flatMap { task =>
        task.brief.referenceAssetIds.traverse(id => AssetTable.find(c,ownerId,id).flatMap(a => IO.fromOption(a)(ApiError("reference_missing","参考素材不存在")))).flatMap { refs =>
          task.baseRevisionId.traverse(id => IO.fromOption(state.history.find(_.id == id))(ApiError("original_missing","原素材版本不存在")).flatMap(r => AssetTable.find(c,ownerId,r.originalAssetId).flatMap(a => IO.fromOption(a)(ApiError("original_missing","原图不存在"))))).map(original => ArtworkContext(refs,original))
        }
      }
  }
