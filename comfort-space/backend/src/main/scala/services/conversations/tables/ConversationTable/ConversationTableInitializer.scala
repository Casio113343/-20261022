package services.conversations.tables.ConversationTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object ConversationTableInitializer:
  private val initializeSql = """CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY, owner_id UUID NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    revision BIGINT NOT NULL DEFAULT 0, payload JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now())"""
  def initialize(connection: Connection): IO[Unit] =
    Jdbc.statement(connection, initializeSql)(Jdbc.update).void
