package services.collection.tables.FavouriteTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object FavouriteTableInitializer:
  private val initializeSql = """CREATE TABLE IF NOT EXISTS favourites (
    owner_id UUID NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL, PRIMARY KEY(owner_id, card_id))"""
  def initialize(connection: Connection): IO[Unit] =
    Jdbc.statement(connection, initializeSql)(Jdbc.update).void
