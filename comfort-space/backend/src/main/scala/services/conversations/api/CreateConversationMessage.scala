package services.conversations.api
import cats.effect.IO
import java.sql.Connection
import java.time.Instant
import java.util.UUID
import services.conversations.objects.Conversation
import services.conversations.tables.ConversationTable.ConversationTable
import services.identity.tables.SessionTable.SessionTable
import services.system.api.{APIMessage, ApiError}
final case class CreateConversationMessage(ownerId: UUID, id: UUID)
    extends APIMessage[Conversation]:
  def plan(connection: Connection): IO[Conversation] =
    SessionTable
      .lock(connection, ownerId)
      .flatMap(_ => ConversationTable.find(connection, ownerId, id))
      .flatMap {
        case Some(existing) => IO.pure(existing)
        case None =>
          ConversationTable.list(connection, ownerId).flatMap { existing =>
            if existing.size >= 100 then IO.raiseError(ApiError.invalid("最多保留 100 段对话，请先删除一些记录。"))
            else
              IO.realTimeInstant.flatMap { now =>
                val value = Conversation(
                  id.toString,
                  "新的对话",
                  now.toString,
                  now.toString,
                  Vector.empty,
                  None,
                  0
                )
                ConversationTable
                  .insert(connection, ownerId, value)
                  .flatMap(inserted =>
                    if inserted then IO.pure(value) else IO.raiseError(ApiError.notFound)
                  )
              }
          }
      }
