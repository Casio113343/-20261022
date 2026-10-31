package services.generation
import cats.effect.IO
import munit.CatsEffectSuite
import java.util.UUID
import services.Fixtures
import services.system.database.Database
import services.identity.api.StartSessionMessage
import services.identity.tables.SessionTable.SessionTableInitializer
import services.library.tables.ResourceTable.ResourceTableInitializer
import services.generation.tables.GenerationTable.GenerationTableInitializer
import services.generation.objects.*
import services.generation.api.*
import services.library.objects.ResourceData
import services.system.generation.{GenerationExecutor,GenerationProvider}
import services.assets.objects.Asset
class GenerationIntegrationSuite extends CatsEffectSuite:
  private def fixture(f: (Database,String,GenerationInput) => IO[Unit]): IO[Unit] = IO.delay(sys.env).flatMap { e =>
    val db = Database(e.getOrElse("DATABASE_URL","jdbc:postgresql://127.0.0.1:55433/workshop"),e.getOrElse("DATABASE_USER","workshop"),e.getOrElse("DATABASE_PASSWORD",""))
    db.transaction(c => SessionTableInitializer.initialize(c) *> ResourceTableInitializer.initialize(c) *> GenerationTableInitializer.initialize(c) *> StartSessionMessage().plan(c)).flatMap { s =>
      IO.delay(UUID.randomUUID().toString).flatMap(id => f(db,s.ownerId,GenerationInput(id,ResourceData("world","生成验收","","",Some(Fixtures.world),None,None),"完善世界背景","scene",false)))
    }
  }
  private def provider(enabled: Boolean, invalid: Boolean = false): GenerationProvider = new GenerationProvider:
    def configured: Boolean = enabled
    def generate(in: GenerationInput, refs: List[Asset], original: Option[Asset]): IO[GenerationOutput] = IO.pure(GenerationOutput(in.data.copy(kind=if invalid then "skill" else "world",content="模型候选结果"),None))
  test("缺少模型保留任务、相同请求幂等、其他用户不能读取") {
    fixture { (db,owner,in) =>
      db.transaction(c => RequestGenerationMessage(owner,"world",in).plan(c)) *>
      GenerationExecutor(db,provider(false)).finish(owner,in.requestId).flatMap(t => IO(assertEquals(t.status,"waiting_for_provider"))) *>
      db.transaction(c => RequestGenerationMessage(owner,"world",in).plan(c)).flatMap(t => IO(assertEquals(t.id,in.requestId))) *>
      db.transaction(c => GetGenerationMessage("other",in.requestId).plan(c)).attempt.flatMap(r => IO(assert(r.isLeft)))
    }
  }
  test("候选生成与资源保存分开，确认幂等且保留生成结果") {
    fixture { (db,owner,in) =>
      db.transaction(c => RequestGenerationMessage(owner,"world",in).plan(c)) *>
      GenerationExecutor(db,provider(true)).finish(owner,in.requestId).flatMap { t =>
        IO { assertEquals(t.status,"succeeded"); assertEquals(t.savedResourceId,None) } *>
        IO.delay(UUID.randomUUID().toString).flatMap { id =>
          val accept = AcceptGenerationInput(in.requestId,id,0)
          db.transaction(c => AcceptGenerationMessage(owner,accept).plan(c)).flatMap(first => db.transaction(c => AcceptGenerationMessage(owner,accept).plan(c)).flatMap(second => IO { assertEquals(first,second);assertEquals(first.version,1);assertEquals(first.history.head.data.content,"模型候选结果") }))
        }
      }
    }
  }
  test("模型类型错误记录失败，重复提交不会自动再调用模型") {
    fixture { (db,owner,in) =>
      db.transaction(c => RequestGenerationMessage(owner,"world",in).plan(c)) *>
      GenerationExecutor(db,provider(true,true)).finish(owner,in.requestId).flatMap { failed =>
        IO(assertEquals(failed.status,"failed")) *>
        GenerationExecutor(db,provider(true)).finish(owner,in.requestId).flatMap(t => IO(assertEquals(t.attempt,1))) *>
        GenerationExecutor(db,provider(true)).finish(owner,in.requestId,true).flatMap(t => IO(assertEquals(t.status,"succeeded")))
      }
    }
  }
