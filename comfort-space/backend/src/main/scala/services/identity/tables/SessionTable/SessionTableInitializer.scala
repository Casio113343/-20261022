package services.identity.tables.SessionTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object SessionTableInitializer:
  private val initializeSql = """CREATE TABLE IF NOT EXISTS visitor_sessions (
    id UUID PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())"""
  def initialize(connection: Connection): IO[Unit] =
    Jdbc.statement(connection, initializeSql)(Jdbc.update).void
