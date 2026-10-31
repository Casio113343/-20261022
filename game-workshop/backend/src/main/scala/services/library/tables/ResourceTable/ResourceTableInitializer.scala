package services.library.tables.ResourceTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object ResourceTableInitializer:
  def initialize(c: Connection): IO[Unit] = Jdbc.execute(c,"CREATE TABLE IF NOT EXISTS workshop_resources (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, version INTEGER NOT NULL, payload JSONB NOT NULL)")(_ => ()).void
