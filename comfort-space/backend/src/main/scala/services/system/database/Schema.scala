package services.system.database
import cats.effect.IO
import java.sql.Connection
import services.identity.tables.SessionTable.SessionTableInitializer
import services.identity.tables.PreferencesTable.PreferencesTableInitializer
import services.conversations.tables.ConversationTable.ConversationTableInitializer
import services.conversations.tables.ReplyRequestTable.ReplyRequestTableInitializer
import services.journal.tables.MoodTable.MoodTableInitializer
import services.collection.tables.FavouriteTable.FavouriteTableInitializer
object Schema:
  def initialize(connection: Connection): IO[Unit] =
    SessionTableInitializer
      .initialize(connection)
      .flatMap(_ => PreferencesTableInitializer.initialize(connection))
      .flatMap(_ => ConversationTableInitializer.initialize(connection))
      .flatMap(_ => ReplyRequestTableInitializer.initialize(connection))
      .flatMap(_ => MoodTableInitializer.initialize(connection))
      .flatMap(_ => FavouriteTableInitializer.initialize(connection))
