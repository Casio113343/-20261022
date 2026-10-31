package services.library.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.library.objects.*
import services.library.objects.apiTypes.ResourceAttachInput
import services.library.tables.ProjectResourceTable.ProjectResourceTable
import services.library.utils.ResourceRules
import services.projects.tables.ProjectTable.ProjectTable
import services.projects.api.SaveProjectMessage
import services.projects.objects.Project
import services.projects.objects.apiTypes.SaveProjectInput
import services.artwork.api.ImportLibraryArtworkMessage
final case class AttachResourceMessage(ownerId: String, request: ResourceAttachInput) extends APIMessage[Project]:
  def plan(c: Connection): IO[Project] = GetResourceMessage(ownerId,request.resourceId).plan(c).flatMap { r =>
    IO.fromOption(r.history.find(_.version == request.resourceVersion))(ApiError("not_found","资源版本不存在",status=404)).flatMap { v =>
      ProjectTable.find(c,ownerId,request.projectId).flatMap { p =>
        IO.raiseWhen(p.version != request.expectedVersion)(ApiError("version_conflict","作品资料已变化，请重新加载",status=409)) *>
          IO.fromEither(ResourceRules.importInput(p.input,r,v,request.target)).flatMap { input =>
            val art = if request.target.startsWith("slot:") then ImportLibraryArtworkMessage(ownerId,p.id,request.expectedManifestRevision,request.target.stripPrefix("slot:"),v,r.id).plan(c).void else IO.unit
            art *> SaveProjectMessage(ownerId,SaveProjectInput(p.id,p.version,input)).plan(c).flatTap(_ => ProjectResourceTable.save(c,p.id,ResourceLink(r.id,v.version,request.target,v.data.title)))
          }
      }
    }
  }
