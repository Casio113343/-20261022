package services.library.tables.ProjectResourceTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object ProjectResourceTableInitializer:
  def initialize(c: Connection): IO[Unit] = Jdbc.execute(c,"CREATE TABLE IF NOT EXISTS workshop_project_resources (project_id TEXT NOT NULL REFERENCES workshop_projects(id) ON DELETE CASCADE, target TEXT NOT NULL, payload JSONB NOT NULL, PRIMARY KEY(project_id,target))")(_ => ()).void
