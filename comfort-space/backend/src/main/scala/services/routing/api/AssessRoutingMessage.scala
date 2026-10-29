package services.routing.api
import cats.effect.IO
import services.conversations.objects.Role
import services.routing.objects.Direction
import java.sql.Connection
import services.conversations.objects.Conversation
import services.system.api.APIMessage
final case class AssessRoutingMessage(conversation: Conversation, minimumTurns: Int)
    extends APIMessage[Option[Direction]]:
  def plan(connection: Connection): IO[Option[Direction]] =
    IO.pure(AssessRoutingMessage.assess(conversation, minimumTurns))
object AssessRoutingMessage:
  private val rules = Vector(
    Direction.Study -> Vector("考试", "成绩", "作业", "工作", "学习", "加班", "学校"),
    Direction.Relationships -> Vector("朋友", "分手", "家人", "父母", "同事", "吵架", "关系"),
    Direction.Self -> Vector("没用", "失败", "不够好", "自责", "比较", "讨厌自己"),
    Direction.Loneliness -> Vector("孤独", "一个人", "没人", "寂寞", "孤单"),
    Direction.Change -> Vector("毕业", "告别", "离开", "失去", "搬家", "变化")
  )
  def assess(conversation: Conversation, minimumTurns: Int): Option[Direction] =
    if conversation.messages.count(_.role == Role.Assistant) < minimumTurns then None
    else
      val text = conversation.messages.filter(_.role == Role.User).map(_.content).mkString(" ")
      val ranked = rules
        .map((direction, words) => direction -> words.count(text.contains))
        .sortBy(pair => -pair._2)
      ranked.headOption
        .filter(best => best._2 >= 2 && ranked.drop(1).headOption.forall(_._2 < best._2))
        .map(_._1)
        .orElse(conversation.direction)
