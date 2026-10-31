package services.artwork
import services.Fixtures
import munit.FunSuite
import services.artwork.utils.ArtworkRules
class ArtworkRulesSuite extends FunSuite:
  test("美术需求只能绑定当前已确认版本") {
    assert(ArtworkRules.build(Fixtures.project,0).isLeft)
    val confirmed = Fixtures.confirmed()
    assert(ArtworkRules.build(confirmed,0).isLeft)
    val requirements = ArtworkRules.build(confirmed,confirmed.version).toOption.getOrElse(fail("requirements"))
    assertEquals(requirements.providerConfigured,false)
    assertEquals(requirements.briefs.map(_.kind),List("scene","character","character"))
    assert(requirements.briefs.head.prompt.contains("云海城市"))
  }
  test("卡牌玩法包含卡面且不会把参考图标为生成结果") {
    val project = Fixtures.project.copy(input=Fixtures.input.copy(genreId="cards"))
    val confirmed = Fixtures.confirmed(project.input)
    val requirements = ArtworkRules.build(confirmed,confirmed.version).toOption.getOrElse(fail("requirements"))
    assertEquals(requirements.briefs.count(_.kind == "card"),3)
    assertEquals(requirements.status,"provider_not_configured")
    assertEquals(Fixtures.project.input,Fixtures.input)
  }
