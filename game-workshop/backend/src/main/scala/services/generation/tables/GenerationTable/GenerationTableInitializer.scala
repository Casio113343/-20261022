package services.generation.tables.GenerationTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object GenerationTableInitializer:
  def initialize(c: Connection): IO[Unit] = Jdbc.execute(c,"CREATE TABLE IF NOT EXISTS workshop_generations(id TEXT NOT NULL, owner_id TEXT NOT NULL, payload JSONB NOT NULL, PRIMARY KEY(owner_id,id))")(_ => ()).void
