package services.identity.tables.SessionTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object SessionTableInitializer:
  def initialize(c: Connection): IO[Unit] = Jdbc.execute(c, "CREATE TABLE IF NOT EXISTS workshop_sessions (owner_id TEXT PRIMARY KEY, token_hash TEXT UNIQUE NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now())")(_ => ()).void
