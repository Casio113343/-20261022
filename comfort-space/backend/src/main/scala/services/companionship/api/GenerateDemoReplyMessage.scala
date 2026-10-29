package services.companionship.api
import cats.effect.IO
import services.conversations.objects.Role
import services.routing.objects.Direction
import java.sql.Connection
import services.conversations.objects.Conversation
import services.system.api.APIMessage
final case class GenerateDemoReplyMessage(conversation: Conversation) extends APIMessage[String]:
  def plan(connection: Connection): IO[String] =
    IO.pure(GenerateDemoReplyMessage.reply(conversation))
object GenerateDemoReplyMessage:
  private val focused = Map(
    Direction.Study -> "努力暂时没有换来期待的结果，真的会让人泄气。先不把一次成绩或工作表现变成对整个人的判决。如果你愿意，我们可以只从最压着你的那一小件事开始。",
    Direction.Relationships -> "在意的关系让你受伤，可能也让你很委屈。你的需要值得被听见；不必现在就决定原谅、离开，或把一切解释清楚。",
    Direction.Self -> "你可能已经很习惯先责怪自己。暂时不需要强迫自己喜欢自己；先用不那么严厉的方式，陪自己过完这一刻。",
    Direction.Loneliness -> "一个人承担这些，确实可能很空、很累。你不必为了有人陪就假装没事；等你愿意时，也可以让一个可信任的人知道你最近不太好。",
    Direction.Change -> "有些告别像是熟悉的生活少了一块。舍不得与不适应可以同时存在，不需要赶着给这段经历一个积极的解释。"
  )
  def reply(conversation: Conversation): String =
    val users = conversation.messages.filter(_.role == Role.User)
    val last = users.lastOption.map(_.content).getOrElse("")
    if Vector("自杀", "自残", "伤害自己", "不想活").exists(last.contains) then
      "听到你这么难受，我想先认真对待你此刻的安全。如果你正准备伤害自己，先远离可能伤到你的物品，联系身边可信任的人陪着你；有紧迫危险时，请联系当地急救服务。这里是演示程序，不能提供实时危机援助。"
    else
      users.size match
        case 1 if Vector("考试", "成绩", "作业", "学习").exists(last.contains) =>
          "这件事让你很失落，也许还有一点已经努力却没有被结果接住的委屈。先不用急着总结自己哪里做得不够好，一次结果装不下你全部的努力。"
        case 1 if Vector("朋友", "分手", "家人", "关系").exists(last.contains) =>
          "在在意的人那里感到失落，往往会格外难受。也许你原本期待的，只是被认真对待。现在不用急着替谁解释，也不用马上作出决定。"
        case 1 if Vector("累", "压力", "撑").exists(last.contains) =>
          "听起来，你已经绷了挺久。就算一时说不清哪里最累，也不用把这些感受整理得很完整。你可以先在这里停一停，不必马上打起精神。"
        case 1 => "谢谢你把这句话放在这里。不管现在的感受清不清楚，你都不需要先找到一个合理的理由。这里没有要立刻振作的要求，你可以按自己的节奏说。"
        case 2 => "我有在跟着你说的这些。事情本身之外，委屈或是对自己的失望，也可能一起压了上来。你不用一边难过，一边证明自己有资格难过。"
        case 3 => "这些感受不必今天就有结论。刚才你说的，我想先好好放在这里：你经历的难受值得被认真对待。现在即使只是停一会儿，也可以。"
        case _ =>
          conversation.direction
            .flatMap(focused.get)
            .getOrElse("你不用把话说得漂亮，也不用让每一次倾诉都有答案。可以继续慢慢说，也可以在这里停一会儿，接下来由你决定。")
