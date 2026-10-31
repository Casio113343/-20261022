package services.artwork.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.system.api.{APIMessage,ApiError}
import services.projects.tables.ProjectTable.ProjectTable
import services.library.objects.ResourceVersion
import services.artwork.objects.{ArtworkManifest,TaskStatus}
import services.artwork.tables.ArtworkTable.ArtworkTable
final case class ImportLibraryArtworkMessage(ownerId: String, projectId: String, expected: Int, slotId: String, source: ResourceVersion, resourceId: String) extends APIMessage[ArtworkManifest]:
  def plan(c: Connection): IO[ArtworkManifest] = ProjectTable.find(c,ownerId,projectId) *> ArtworkTable.find(c,projectId).flatMap { old =>
    IO.raiseWhen(old.revision != expected)(ApiError("artwork_conflict","美术已变化，请重新读取后选用",status=409)) *>
      IO.fromOption(old.slots.find(s => s.id == slotId && s.active))(ApiError("slot_missing","请先确认方案并提交制作以建立美术位置，再选用素材")).flatMap { slot =>
        IO.raiseWhen(!source.artworkKind.contains(slot.kind.toString))(ApiError("incompatible_artwork","素材用途不兼容，需要另行加工；本次未更换图片")) *>
          IO.fromOption(source.artwork)(ApiError("artwork_missing","参考上传不是正式生成素材")) .flatMap { sourceArt =>
            IO.delay(UUID.randomUUID().toString).flatMap { id => IO.realTimeInstant.flatMap { now =>
              val imported = sourceArt.copy(id=id,slotId=slotId,parentRevisionId=slot.currentRevisionId,instruction=s"明确复用资源 $resourceId 版本 ${source.version}",createdAt=now.toString)
              val active = Set(TaskStatus.Pending,TaskStatus.Running,TaskStatus.Failed,TaskStatus.Blocked)
              val next = old.copy(revision=old.revision+1,slots=old.slots.map(s => if s.id == slotId then s.copy(currentRevisionId=Some(id)) else s),history=old.history :+ imported,tasks=old.tasks.map(t => if t.slotId == slotId && active(t.status) then t.copy(status=TaskStatus.Obsolete,leaseToken=None,leaseUntil=0L,error=Some("用户明确选用资源库素材")) else t))
              ArtworkTable.save(c,old.revision,next)
            }}
          }
      }
  }
