package services.system.generation
import cats.effect.IO
import cats.syntax.all.*
import scala.concurrent.duration.*
import java.util.{UUID,Base64}
import services.system.database.Database
import services.system.api.ApiError
import services.generation.objects.*
import services.generation.api.GetGenerationMessage
import services.generation.tables.GenerationTable.GenerationTable
import services.library.objects.ResourceVersion
import services.assets.tables.AssetTable.AssetTable
import services.artwork.api.GetArtworkManifestMessage
import services.artwork.objects.ArtworkRevision
import services.system.artwork.ImageProcessor
final case class GenerationExecutor(database: Database, provider: GenerationProvider):
  def finish(owner: String, id: String, retry: Boolean = false): IO[GenerationTask] = IO.realTime.map(_.toMillis).flatMap { now =>
    database.transaction(c => GetGenerationMessage(owner,id).plan(c).flatMap { t =>
      if t.status == "failed" && !retry || t.status == "succeeded" || t.status == "running" && t.leaseUntil > now then IO.pure((t,false))
      else GenerationTable.save(c,owner,t.copy(status=if provider.configured then "running" else "waiting_for_provider",attempt=t.attempt+1,leaseUntil=now+120000,error=None)).map(n => (n,provider.configured))
    }).flatMap { case (task,run) =>
      if !run then IO.pure(task)
      else
        val work = database.transaction { c =>
          val d = task.input.data
          val refs = d.world.toList.flatMap(_.images) ++ d.character.toList.flatMap(_.images)
          refs.traverse(i => AssetTable.find(c,owner,i.assetId).flatMap(a => IO.fromOption(a)(ApiError("asset_missing","参考图已不可用")))).flatMap { images =>
            d.source.traverse(s => GetArtworkManifestMessage(owner,s.projectId).plan(c).flatMap(m => IO.fromOption(m.history.find(_.id == s.revisionId))(ApiError("artwork_missing","原图不存在"))).flatMap(r => AssetTable.find(c,owner,r.originalAssetId).flatMap(a => IO.fromOption(a)(ApiError("asset_missing","原图不可用"))))).map(original => (images,original))
          }
        }.flatMap { case (refs,original) => provider.generate(task.input,refs,original) }.flatMap { out =>
          IO.raiseWhen(out.data.kind != task.input.data.kind || task.input.generateImage != out.image.nonEmpty)(ApiError("invalid_model_output","成果类型或图片输出不匹配")) *>
          out.image.traverse(image => ImageProcessor.process(image,task.input.imageKind)).flatMap { processed =>
            IO.realTimeInstant.flatMap { time => IO.delay(UUID.randomUUID().toString).flatMap { revisionId =>
              database.transaction(c => GetGenerationMessage(owner,id).plan(c).flatMap { current =>
                if current.attempt != task.attempt || current.status != "running" then IO.pure(current)
                else processed.traverse_(p => AssetTable.insert(c,owner,p.original,Base64.getDecoder.decode(p.original.base64)) *> AssetTable.insert(c,owner,p.processed,Base64.getDecoder.decode(p.processed.base64))) *>
                  GenerationTable.save(c,owner,current.copy(status="succeeded",leaseUntil=0L,candidate=Some(ResourceVersion(0,out.data.copy(source=None),processed.map(p => ArtworkRevision(revisionId,"standalone",p.original.id,p.processed.id,p.originalHash,p.processedHash,None,0,out.image.fold("")(_.provider),task.input.instruction,time.toString)),processed.map(_ => task.input.imageKind),time.toString))))
              })
            }}
          }
        }
        work.timeout(100.seconds).handleErrorWith(_ => database.transaction(c => GetGenerationMessage(owner,id).plan(c).flatMap(t => if t.attempt != task.attempt || t.status != "running" then IO.pure(t) else GenerationTable.save(c,owner,t.copy(status="failed",leaseUntil=0L,error=Some("模型生成或图片加工失败，可重试；未覆盖已有资源"))))))
    }
  }
