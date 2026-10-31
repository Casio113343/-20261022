package services.projects.tables.ProjectTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object ProjectTableInitializer:
  def initialize(c: Connection): IO[Unit] = Jdbc.execute(c, "CREATE TABLE IF NOT EXISTS workshop_projects (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES workshop_sessions(owner_id), request_id TEXT NOT NULL, version INTEGER NOT NULL CHECK(version >= 0), payload JSONB NOT NULL, UNIQUE(owner_id, request_id))")(_ => ()).void
