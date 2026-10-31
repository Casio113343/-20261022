package services.generation.tables.GenerationTable
import cats.effect.IO
import java.sql.Connection
import io.circe.parser.decode
import io.circe.syntax.*
import services.generation.objects.GenerationTask
import services.system.database.Jdbc
object GenerationTable:
  private val findSql = "SELECT payload::text FROM workshop_generations WHERE owner_id = ? AND id = ? FOR UPDATE"
  def find(c: Connection, owner: String, id: String): IO[Option[GenerationTask]] = Jdbc.query(c,findSql)(s => {s.setString(1,owner);s.setString(2,id)})(_.getString(1)).flatMap(_.headOption.fold(IO.pure(Option.empty[GenerationTask]))(s => IO.fromEither(decode[GenerationTask](s)).map(Some(_))))
  private val insertSql = "INSERT INTO workshop_generations(owner_id,id,payload) VALUES(?,?,?::jsonb) ON CONFLICT DO NOTHING"
  def insert(c: Connection, owner: String, t: GenerationTask): IO[Unit] = Jdbc.execute(c,insertSql)(s => {s.setString(1,owner);s.setString(2,t.id);s.setString(3,t.asJson.noSpaces)}).void
  private val saveSql = "UPDATE workshop_generations SET payload = ?::jsonb WHERE owner_id = ? AND id = ?"
  def save(c: Connection, owner: String, t: GenerationTask): IO[GenerationTask] = Jdbc.execute(c,saveSql)(s => {s.setString(1,t.asJson.noSpaces);s.setString(2,owner);s.setString(3,t.id)}).as(t)
