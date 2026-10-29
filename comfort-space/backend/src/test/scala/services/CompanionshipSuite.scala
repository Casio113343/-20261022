package services

import munit.CatsEffectSuite
import services.conversations.objects.{Conversation, Message, Role}
import services.routing.objects.Direction
import services.routing.api.AssessRoutingMessage
import services.companionship.api.GenerateDemoReplyMessage

class CompanionshipSuite extends CatsEffectSuite:
  private def conversation(turns: Int, text: String): Conversation =
    Conversation(
      "test",
      "test",
      "now",
      "now",
      Vector(Message("u", Role.User, text, "now")) ++ Vector.tabulate(turns)(n =>
        Message(s"a$n", Role.Assistant, "陪伴", "now")
      ),
      None,
      0
    )

  test("早期不分类，信息明确且门槛达到后才调整方向") {
    val input = conversation(2, "考试成绩让我失落")
    assertEquals(AssessRoutingMessage.assess(input, 3), None)
    assertEquals(AssessRoutingMessage.assess(conversation(3, "考试成绩让我失落"), 3), Some(Direction.Study))
    assertEquals(input.messages.size, 3)
  }
  test("信息不足和方向冲突均不强行分类") {
    assertEquals(AssessRoutingMessage.assess(conversation(5, "今天有点累"), 3), None)
    assertEquals(AssessRoutingMessage.assess(conversation(5, "考试成绩和朋友关系"), 3), None)
  }
  test("轮数门槛作为显式参数，不是用户必须完成的固定次数") {
    assertEquals(AssessRoutingMessage.assess(conversation(3, "考试成绩"), 5), None)
  }
  test("首轮回应先接住情绪，不以连续问题开场") {
    val input = conversation(0, "考试成绩让我失落")
    val response = GenerateDemoReplyMessage.reply(input)
    assert(response.contains("失落"))
    assert(!response.contains("？"))
    assertEquals(GenerateDemoReplyMessage.reply(input), response)
  }
  test("明显危险关键词优先于轮次和分类") {
    val response = GenerateDemoReplyMessage.reply(conversation(0, "我不想活了"))
    assert(response.contains("当地急救服务"))
    assert(response.contains("演示程序"))
  }
  test("枚举拒绝非法输入并保持统一表示") {
    assert(Role.fromString("administrator").isLeft)
    assertEquals(Direction.fromString(Direction.toString(Direction.Study)), Right(Direction.Study))
  }
