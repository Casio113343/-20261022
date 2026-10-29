package services.identity.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.identity.objects.apiTypes.SavedState
import services.identity.tables.PreferencesTable.PreferencesTable
import services.identity.tables.SessionTable.SessionTable
import services.conversations.tables.ConversationTable.ConversationTable
import services.journal.tables.MoodTable.MoodTable
import services.collection.tables.FavouriteTable.FavouriteTable
import services.system.api.NoRequestMessage
final case class GetStateMessage(ownerId: UUID) extends NoRequestMessage[SavedState]:
  def plan(connection: Connection): IO[SavedState] =
    SessionTable
      .lock(connection, ownerId)
      .flatMap(_ => ConversationTable.list(connection, ownerId))
      .flatMap(conversations =>
        FavouriteTable
          .list(connection, ownerId)
          .flatMap(favourites =>
            MoodTable
              .list(connection, ownerId)
              .flatMap(moods =>
                PreferencesTable
                  .find(connection, ownerId)
                  .map(preferences => SavedState(1, conversations, favourites, moods, preferences))
              )
          )
      )
