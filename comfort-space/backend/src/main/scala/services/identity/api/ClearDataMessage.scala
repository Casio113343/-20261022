package services.identity.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.identity.objects.Preferences
import services.identity.tables.PreferencesTable.PreferencesTable
import services.identity.tables.SessionTable.SessionTable
import services.conversations.tables.ConversationTable.ConversationTable
import services.journal.tables.MoodTable.MoodTable
import services.collection.tables.FavouriteTable.FavouriteTable
import services.system.api.NoRequestMessage
import services.system.objects.apiTypes.Acknowledgement
final case class ClearDataMessage(ownerId: UUID) extends NoRequestMessage[Acknowledgement]:
  def plan(connection: Connection): IO[Acknowledgement] =
    SessionTable
      .lock(connection, ownerId)
      .flatMap(_ => ConversationTable.clear(connection, ownerId))
      .flatMap(_ => MoodTable.clear(connection, ownerId))
      .flatMap(_ => FavouriteTable.clear(connection, ownerId))
      .flatMap(_ => PreferencesTable.save(connection, ownerId, Preferences("", false, false)))
      .as(Acknowledgement(true))
