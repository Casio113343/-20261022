package services.conversations.tables.ReplyRequestTable
import cats.effect.IO
import services.conversations.tables.ConversationTable.ConversationTable
import io.circe.syntax.*
import java.sql.Connection
import java.util.UUID
import services.conversations.objects.Conversation
import services.system.database.Jdbc
import services.system.api.ApiError
object ReplyRequestTable:
  private val findSql =
    "SELECT conversation_id, content FROM reply_requests WHERE owner_id = ? AND request_id = ?"
  def replay(
      connection: Connection,
      ownerId: UUID,
      requestId: UUID,
      conversationId: UUID,
      content: String
  ): IO[Option[Conversation]] =
    Jdbc
      .statement(connection, findSql)(statement =>
        IO.blocking { statement.setObject(1, ownerId); statement.setObject(2, requestId) }
          .flatMap(_ => Jdbc.rows(statement)(r => (r.getObject(1, classOf[UUID]), r.getString(2))))
      )
      .flatMap(_.headOption match
        case None => IO.pure(None)
        case Some((id, storedContent)) =>
          if id != conversationId || storedContent != content then
            IO.raiseError(ApiError.conflict("同一请求编号不能用于不同消息。"))
          else ConversationTable.find(connection, ownerId, conversationId))
  private val insertSql =
    "INSERT INTO reply_requests(owner_id, request_id, conversation_id, content) VALUES (?, ?, ?, ?)"
  def insert(
      connection: Connection,
      ownerId: UUID,
      requestId: UUID,
      content: String,
      response: Conversation
  ): IO[Unit] =
    Jdbc.statement(connection, insertSql)(statement =>
      IO.blocking {
        statement.setObject(1, ownerId); statement.setObject(2, requestId);
        statement.setObject(3, UUID.fromString(response.id))
        statement.setString(4, content)
      }.flatMap(_ => Jdbc.update(statement))
        .void
    )
