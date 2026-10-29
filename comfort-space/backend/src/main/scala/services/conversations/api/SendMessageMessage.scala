package services.conversations.api
import cats.effect.IO
import services.conversations.objects.Role
import services.routing.objects.Direction
import java.sql.Connection
import java.util.UUID
import services.conversations.objects.{Conversation, Message}
import services.conversations.tables.ConversationTable.ConversationTable
import services.conversations.tables.ReplyRequestTable.ReplyRequestTable
import services.identity.tables.SessionTable.SessionTable
import services.companionship.api.GenerateDemoReplyMessage
import services.routing.api.AssessRoutingMessage
import services.system.api.{APIMessage, ApiError}
final case class SendMessageMessage(
    ownerId: UUID,
    conversationId: UUID,
    requestId: UUID,
    content: String,
    minimumTurns: Int
) extends APIMessage[Conversation]:
  def plan(connection: Connection): IO[Conversation] =
    val text = content.trim
    if text.isEmpty || text.length > 2000 then IO.raiseError(ApiError.invalid("消息需要 1 到 2000 个字符。"))
    else
      SessionTable
        .lock(connection, ownerId)
        .flatMap(_ =>
          ReplyRequestTable.replay(connection, ownerId, requestId, conversationId, text)
        )
        .flatMap {
          case Some(response) => IO.pure(response)
          case None =>
            ConversationTable.find(connection, ownerId, conversationId).flatMap {
              case None => IO.raiseError(ApiError.notFound)
              case Some(old) if old.messages.size >= 500 =>
                IO.raiseError(ApiError.invalid("这段对话已达 250 轮，请新开一段对话。"))
              case Some(old) =>
                IO.realTimeInstant.flatMap { now =>
                  IO.delay((UUID.randomUUID().toString, UUID.randomUUID().toString)).flatMap {
                    case (userId, replyId) =>
                      val incoming = Message(userId, Role.User, text, now.toString)
                      val context = old.copy(messages = old.messages :+ incoming)
                      // 仅本地确定性模板在短事务内执行；未来网络模型必须拆为预约/生成/提交三阶段。
                      GenerateDemoReplyMessage(context).plan(connection).flatMap { reply =>
                        val completed = context.copy(
                          title = if old.messages.isEmpty then text.take(22) else old.title,
                          updatedAt = now.toString,
                          revision = old.revision + 1,
                          messages = context.messages :+ Message(
                            replyId,
                            Role.Assistant,
                            reply,
                            now.toString
                          )
                        )
                        AssessRoutingMessage(completed, minimumTurns).plan(connection).flatMap {
                          direction =>
                            val result = completed.copy(direction = direction)
                            ConversationTable
                              .save(connection, ownerId, result, old.revision)
                              .flatMap(saved =>
                                if !saved then IO.raiseError(ApiError.conflict("会话已变化，请刷新后重试。"))
                                else
                                  ReplyRequestTable
                                    .insert(connection, ownerId, requestId, text, result)
                                    .as(result)
                              )
                        }
                      }
                  }
                }
            }
        }
