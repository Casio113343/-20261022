package services.artwork
import services.Fixtures
import munit.FunSuite
import services.artwork.objects.*
import services.artwork.utils.ManifestRules
import services.projects.objects.*
class ManifestRulesSuite extends FunSuite:
  private def value[A](result: Either[?,A]): A = result.toOption.getOrElse(fail("预期规则转换成功"))
  private def confirmed(input: GameInput = Fixtures.input): Project =
    Fixtures.confirmed(input)
  private def planned(p: Project): ArtworkManifest = value(ManifestRules.synchronize(p,p.version,ArtworkManifest(p.id,0,Nil,Nil,Nil)))
  private def complete(state: ArtworkManifest, id: String, suffix: String = "1"): ArtworkManifest =
    val claimed = value(ManifestRules.claim(state,id,s"token-$suffix",0L,true))
    val task = claimed.tasks.find(_.id == id).getOrElse(fail("task"))
    value(ManifestRules.succeed(claimed,id,s"token-$suffix",ArtworkRevision(s"r-$id-$suffix",task.slotId,s"o-$id-$suffix",s"p-$id-$suffix",s"oh-$id-$suffix",s"ph-$id-$suffix",task.baseRevisionId,task.brief.projectVersion,"test-only",task.instruction,"t")))
  private def ready(p: Project): ArtworkManifest =
    val state = planned(p)
    state.tasks.foldLeft(state)((s,t) => complete(s,t.id))
  test("首次按当前设定建立任务，重复制作不会再次生成") {
    val p = confirmed()
    val state = planned(p)
    assertEquals(state.tasks.size,3)
    assert(state.tasks.forall(_.brief.prompt.contains("云海城市")))
    assertEquals(value(ManifestRules.synchronize(p,p.version,state)),state)
    assertEquals(state.history,Nil)
  }
  test("修改规则和名称后保留全部美术引用与哈希") {
    val p = confirmed()
    val old = ready(p)
    val updated = p.input.copy(title="改名",requirements="伤害从10改为15")
    val next = Fixtures.confirmed(updated).copy(version=5,plan=p.plan.map(_.copy(inputVersion=5,source=updated)))
    val synced = value(ManifestRules.synchronize(next,next.version,old))
    assertEquals(ManifestRules.bindings(synced),ManifestRules.bindings(old))
    assertEquals(synced.tasks,old.tasks)
    assert(ManifestRules.ready(synced))
    assertEquals(old.history.size,3)
  }
  test("明确改图只影响指定目标，完成前旧图仍在") {
    val old = ready(confirmed())
    val edited = value(ManifestRules.edit(old,old.revision,"edit-1",List("scene"),"只把场景光线改为夜晚，保留构图"))
    assertEquals(ManifestRules.bindings(edited),ManifestRules.bindings(old))
    assert(!ManifestRules.ready(edited))
    val task = edited.tasks.last
    assertEquals(task.baseRevisionId,old.slots.find(_.id == "scene").flatMap(_.currentRevisionId))
    val result = complete(edited,task.id,"2")
    assertEquals(ManifestRules.bindings(result).filterNot(_.slotId == "scene"),ManifestRules.bindings(old).filterNot(_.slotId == "scene"))
    assertEquals(result.history.size,old.history.size+1)
    assertEquals(value(ManifestRules.edit(result,old.revision,"edit-1",List("scene"),task.instruction)),result)
    assert(ManifestRules.edit(result,result.revision,"edit-1",List("scene"),"重画全部").isLeft)
  }
  test("新增人物仅新增该人物任务，原有场景与角色不重画") {
    val c = Character("hero","林","","","","","","","","","","",Nil)
    val p = confirmed(Fixtures.input.copy(characters=List(c)))
    val old = ready(p)
    val next = confirmed(p.input.copy(characters=List(c,c.copy(id="second",name="舟"))))
    val state = value(ManifestRules.synchronize(next,next.version,old))
    assertEquals(state.tasks.filter(_.status == TaskStatus.Pending).map(_.slotId),List("character-second"))
    assertEquals(ManifestRules.bindings(state).filter(_.slotId == "scene"),ManifestRules.bindings(old).filter(_.slotId == "scene"))
  }
  test("失败和重试只处理失败任务，成功素材不改变") {
    val p = confirmed()
    val initial = planned(p)
    val first = complete(initial,initial.tasks.head.id)
    val task = first.tasks(1)
    val claimed = value(ManifestRules.claim(first,task.id,"token",0,true))
    val failed = ManifestRules.fail(claimed,task.id,"token","provider_failed")
    val retried = value(ManifestRules.retry(failed,task.id,1))
    assertEquals(ManifestRules.bindings(retried),ManifestRules.bindings(first))
    assertEquals(value(ManifestRules.retry(retried,initial.tasks.head.id,1)),retried)
    assertEquals(retried.tasks.find(_.id == task.id).map(_.status),Some(TaskStatus.Pending))
  }
  test("未配置模型只标记阻塞，不能产生伪造素材") {
    val initial = planned(confirmed())
    val next = value(ManifestRules.claim(initial,initial.tasks.head.id,"token",0,false))
    assertEquals(next.tasks.head.status,TaskStatus.Blocked)
    assertEquals(next.history,Nil)
    assert(!ManifestRules.ready(next))
  }
  test("租约过期重试后旧执行结果不能覆盖新结果") {
    val initial = planned(confirmed())
    val id = initial.tasks.head.id
    val first = value(ManifestRules.claim(initial,id,"old",0,true))
    assert(ManifestRules.retry(first,id,10).isLeft)
    val retried = value(ManifestRules.retry(first,id,120001))
    val second = value(ManifestRules.claim(retried,id,"new",120002,true))
    assert(!ManifestRules.accepts(second,id,"old"))
    assert(ManifestRules.accepts(second,id,"new"))
  }
  test("恢复旧图保留历史并废弃该素材的在途任务") {
    val old = ready(confirmed())
    val original = old.slots.find(_.id == "scene").flatMap(_.currentRevisionId).getOrElse(fail("scene"))
    val edited = value(ManifestRules.edit(old,old.revision,"e",List("scene"),"夜晚"))
    val claimed = value(ManifestRules.claim(edited,edited.tasks.last.id,"old",0,true))
    val restored = value(ManifestRules.restore(claimed,claimed.revision,original))
    assertEquals(restored.history,old.history)
    assertEquals(ManifestRules.bindings(restored),ManifestRules.bindings(old))
    assert(!ManifestRules.accepts(restored,edited.tasks.last.id,"old"))
  }
