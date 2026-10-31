package services.library.api
import cats.effect.IO
import cats.syntax.all.*
import java.sql.Connection
import services.system.api.{APIMessage,ApiError}
import services.library.objects.*
import services.library.objects.apiTypes.ResourceSaveInput
import services.library.tables.ResourceTable.ResourceTable
import services.library.utils.ResourceRules
import services.assets.tables.AssetTable.AssetTable
import services.artwork.api.GetArtworkManifestMessage
final case class SaveResourceMessage(ownerId: String, request: ResourceSaveInput) extends APIMessage[CreativeResource]:
  def plan(c: Connection): IO[CreativeResource] =
    val d = request.data
    val images = d.world.toList.flatMap(_.images) ++ d.character.toList.flatMap(_.images)
    val texts = d.world.toList.flatMap(w => List(w.background,w.conflict,w.rules,w.visual,w.preserve,w.freedom)) ++ d.character.toList.flatMap(ch => List(ch.name,ch.identity,ch.faction,ch.background,ch.personality,ch.catchphrase,ch.relationships,ch.skills,ch.role,ch.preserve,ch.freedom))
    IO.fromEither(ResourceRules.validate(d)) *> IO.raiseWhen(request.resourceId.trim.isEmpty || request.resourceId.length > 80 || texts.exists(_.length > 6000) || d.world.exists(_.images.size > 6) || d.character.exists(_.images.size > 3) || images.exists(i => i.purpose.length > 200))(ApiError("invalid_resource","资料长度或图片数量超出限制")) *>
      images.traverse_(i => AssetTable.find(c,ownerId,i.assetId).flatMap(a => IO.raiseWhen(a.isEmpty)(ApiError("asset_missing","参考图不存在或无权访问")))) *>
      ResourceTable.find(c,ownerId,request.resourceId).flatMap { old =>
        IO.raiseWhen(old.fold(0)(_.version) != request.expectedVersion)(ApiError("resource_conflict","资源有新版本，请重新读取后保存",status=409)) *>
        IO.raiseWhen(old.exists(_.history.size >= 100))(ApiError("resource_limit","单项资源最多保存100个版本")) *>
        IO.raiseWhen(old.flatMap(_.history.lastOption).exists(_.data.kind != d.kind))(ApiError("resource_kind","已有资源不能更换服务类型")) *>
        d.source.traverse(s => GetArtworkManifestMessage(ownerId,s.projectId).plan(c).flatMap { m =>
          IO.fromOption(m.history.find(_.id == s.revisionId))(ApiError("artwork_missing","所选生成素材版本不存在")).flatMap(a => IO.fromOption(m.slots.find(_.id == a.slotId))(ApiError("artwork_missing","素材用途不存在")).map(slot => (a,slot.kind.toString)))
        }).flatMap { art =>
          IO.realTimeInstant.flatMap { now =>
            val next = ResourceVersion(request.expectedVersion+1,d,art.map(_._1),art.map(_._2),now.toString)
            ResourceTable.save(c,ownerId,request.expectedVersion,CreativeResource(request.resourceId,next.version,old.toList.flatMap(_.history) :+ next))
          }
        }
      }
