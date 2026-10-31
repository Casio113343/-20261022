package services.projects.tables.GameVersionTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object GameVersionTableInitializer:
  def initialize(c: Connection): IO[Unit] = Jdbc.execute(c,"CREATE TABLE IF NOT EXISTS workshop_game_versions (artifact_id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES workshop_projects(id) ON DELETE CASCADE, payload JSONB NOT NULL)")(_ => ()).void
