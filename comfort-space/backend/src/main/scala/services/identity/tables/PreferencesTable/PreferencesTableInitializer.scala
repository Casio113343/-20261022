package services.identity.tables.PreferencesTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object PreferencesTableInitializer:
  private val initializeSql = """CREATE TABLE IF NOT EXISTS preferences (
    owner_id UUID PRIMARY KEY REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    nickname TEXT NOT NULL DEFAULT '', remember BOOLEAN NOT NULL DEFAULT false,
    reduced_motion BOOLEAN NOT NULL DEFAULT false)"""
  def initialize(connection: Connection): IO[Unit] =
    Jdbc.statement(connection, initializeSql)(Jdbc.update).void
