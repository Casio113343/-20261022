package services.artwork.api
import cats.effect.IO
import java.sql.Connection
import java.util.{Base64,UUID}
import services.system.api.{APIMessage,ApiError}
import services.artwork.objects.{ArtworkTask,ArtworkRevision,ProcessedArtwork}
import services.artwork.utils.{ManifestRules,ArtworkRules}
import services.artwork.tables.ArtworkTable.ArtworkTable
import services.projects.tables.ProjectTable.ProjectTable
import services.assets.tables.AssetTable.AssetTable
final case class CompleteArtworkTaskMessage(ownerId: String, projectId: String, taskId: String, token: String, result: ProcessedArtwork, provider: String) extends APIMessage[ArtworkTask]:
  def plan(c: Connection): IO[ArtworkTask] = ProjectTable.find(c,ownerId,projectId).flatMap { project => ArtworkTable.find(c,projectId).flatMap { old =>
    IO.fromOption(old.tasks.find(_.id == taskId))(ApiError("not_found","任务不存在",status=404)).flatMap { task =>
      IO.raiseUnless(ArtworkRules.required(project.input).exists(_.slotId == task.slotId))(ApiError("stale_artwork_result","对应对象已移除",status=409)) *>
        IO.realTimeInstant.flatMap(now => IO.delay(UUID.randomUUID().toString).flatMap { id =>
          IO.fromEither(ManifestRules.succeed(old,task.id,token,ArtworkRevision(id,task.slotId,result.original.id,result.processed.id,result.originalHash,result.processedHash,task.baseRevisionId,task.brief.projectVersion,provider,task.instruction,now.toString))).flatMap { next =>
            IO.blocking((Base64.getDecoder.decode(result.original.base64),Base64.getDecoder.decode(result.processed.base64))).flatMap { case (source,rendered) =>
              AssetTable.insert(c,ownerId,result.original,source) *> AssetTable.insert(c,ownerId,result.processed,rendered) *> ArtworkTable.save(c,old.revision,next).flatMap(state => IO.fromOption(state.tasks.find(_.id == taskId))(ApiError("not_found","任务不存在",status=404)))
            }
          }
        })
    }
  }}
