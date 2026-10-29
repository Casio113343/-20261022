package services.conversations.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.conversations.objects.Conversation
import services.conversations.tables.ConversationTable.ConversationTable
import services.system.api.{APIMessage, ApiError}
final case class GetConversationMessage(ownerId: UUID, id: UUID) extends APIMessage[Conversation]:
  def plan(connection: Connection): IO[Conversation] = ConversationTable
    .find(connection, ownerId, id)
    .flatMap(_.fold(IO.raiseError[Conversation](ApiError.notFound))(IO.pure))
