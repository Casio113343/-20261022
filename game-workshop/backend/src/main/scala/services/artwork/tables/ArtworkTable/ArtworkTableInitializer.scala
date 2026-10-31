package services.artwork.tables.ArtworkTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object ArtworkTableInitializer:
  def initialize(c: Connection): IO[Unit] = Jdbc.execute(c,"CREATE TABLE IF NOT EXISTS workshop_artwork (project_id TEXT PRIMARY KEY REFERENCES workshop_projects(id) ON DELETE CASCADE, revision INTEGER NOT NULL, payload JSONB NOT NULL)")(_ => ()).void
