package services.assets.tables.AssetTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object AssetTableInitializer:
  def initialize(c: Connection): IO[Unit] = Jdbc.execute(c, "CREATE TABLE IF NOT EXISTS workshop_assets (id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES workshop_sessions(owner_id), mime TEXT NOT NULL, data BYTEA NOT NULL)")(_ => ()).void
