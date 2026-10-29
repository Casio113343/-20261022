package services.conversations.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.conversations.tables.ConversationTable.ConversationTable
import services.identity.tables.SessionTable.SessionTable
import services.system.api.{APIMessage, ApiError}
import services.system.objects.apiTypes.Acknowledgement
final case class DeleteConversationMessage(ownerId: UUID, id: UUID)
    extends APIMessage[Acknowledgement]:
  def plan(connection: Connection): IO[Acknowledgement] =
    SessionTable
      .lock(connection, ownerId)
      .flatMap(_ => ConversationTable.delete(connection, ownerId, id))
      .flatMap(deleted =>
        if deleted then IO.pure(Acknowledgement(true)) else IO.raiseError(ApiError.notFound)
      )
