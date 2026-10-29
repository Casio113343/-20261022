package services.conversations.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.conversations.objects.Conversation
import services.conversations.tables.ConversationTable.ConversationTable
import services.system.api.NoRequestMessage
final case class ListConversationsMessage(ownerId: UUID)
    extends NoRequestMessage[Vector[Conversation]]:
  def plan(connection: Connection): IO[Vector[Conversation]] =
    ConversationTable.list(connection, ownerId)
