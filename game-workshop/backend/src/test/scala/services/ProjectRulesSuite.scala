package services
import munit.FunSuite
import services.projects.utils.ProjectRules
import services.projects.objects.*
class ProjectRulesSuite extends FunSuite:
  test("空白参考不允许整理，但允许保存草稿") {
    val input = Fixtures.input.copy(reference="  ")
    assert(ProjectRules.validate(input,false).isRight)
    assertEquals(ProjectRules.validate(input,true).left.toOption.map(_.field),Some("reference"))
  }
  test("相同输入产生相同结果且旧数据保持不变") {
    val a = ProjectRules.prepare(Fixtures.project,0,"t")
    assertEquals(a,ProjectRules.prepare(Fixtures.project,0,"t"))
    assertEquals(Fixtures.project.plan,None)
  }
  test("版本冲突拒绝覆盖") {
    assertEquals(ProjectRules.save(Fixtures.project,9,Fixtures.input,"t").left.toOption.map(_.code),Some("version_conflict"))
  }
  test("未确认不能生成，确认之后生成幂等") {
    val p = ProjectRules.prepare(Fixtures.project,0,"t").toOption.getOrElse(fail("prepare"))
    assert(ProjectRules.generate(p,p.version,"t","a").isLeft)
    val confirmed = ProjectRules.confirm(p,p.version,"t").toOption.getOrElse(fail("confirm"))
    val generated = ProjectRules.generate(confirmed,confirmed.version,"t","a").toOption.getOrElse(fail("generate"))
    assertEquals(ProjectRules.generate(generated,generated.version,"t","b"),Right(generated))
  }
  test("修改资料清除方案确认和原型，原始人物保留") {
    val c = Character("c","林","","","","胆小","先等等","","保护朋友","辅助","不能改名字","",Nil)
    val in = Fixtures.input.copy(characters=List(c))
    val saved = ProjectRules.save(Fixtures.project,0,in,"t").toOption.getOrElse(fail("save"))
    val changed = ProjectRules.save(saved,1,in.copy(genreId="moba"),"t").toOption.getOrElse(fail("switch"))
    assertEquals(changed.input.characters,List(c))
    assertEquals(changed.input.world,Fixtures.world)
    assertEquals(changed.plan,None)
  }
  test("非法难度和重复人物拒绝") {
    val p = ProjectRules.prepare(Fixtures.project,0,"t").toOption.getOrElse(fail("prepare"))
    assert(ProjectRules.revise(p,1,Nil,RuntimeSettings(4,5),"t").isLeft)
  }
  test("未支持类型可以整理但不能试玩") {
    val p = Fixtures.project.copy(input=Fixtures.input.copy(genreId="rts"))
    val prepared = ProjectRules.prepare(p,0,"t").toOption.getOrElse(fail("prepare"))
    val confirmed = ProjectRules.confirm(prepared,1,"t").toOption.getOrElse(fail("confirm"))
    assertEquals(ProjectRules.generate(confirmed,2,"t","a").left.toOption.map(_.code),Some("unsupported"))
  }
