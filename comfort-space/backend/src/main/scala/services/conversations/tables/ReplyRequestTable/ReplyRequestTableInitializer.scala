package services.conversations.tables.ReplyRequestTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object ReplyRequestTableInitializer:
  private val initializeSql = """CREATE TABLE IF NOT EXISTS reply_requests (
    owner_id UUID NOT NULL REFERENCES visitor_sessions(id) ON DELETE CASCADE,
    request_id UUID NOT NULL, conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    content TEXT NOT NULL, PRIMARY KEY(owner_id, request_id))"""
  def initialize(connection: Connection): IO[Unit] =
    Jdbc.statement(connection, initializeSql)(Jdbc.update).void
