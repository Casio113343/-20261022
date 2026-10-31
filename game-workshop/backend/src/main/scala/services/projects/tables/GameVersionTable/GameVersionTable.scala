package services.projects.tables.GameVersionTable
import cats.effect.IO
import cats.syntax.all.*
import java.sql.Connection
import io.circe.parser.decode
import io.circe.syntax.*
import services.projects.objects.Project
import services.system.database.Jdbc
object GameVersionTable:
  private val insertSql = "INSERT INTO workshop_game_versions(artifact_id,project_id,payload) VALUES(?,?,?::jsonb) ON CONFLICT(artifact_id) DO NOTHING"
  def insert(c: Connection, p: Project): IO[Unit] = p.artifact.fold(IO.unit)(a => Jdbc.execute(c,insertSql)(s => {s.setString(1,a.id);s.setString(2,p.id);s.setString(3,p.asJson.noSpaces)}).void)
  private val listSql = "SELECT payload::text FROM workshop_game_versions WHERE project_id = ? ORDER BY (payload->>'version')::int DESC LIMIT 100"
  def list(c: Connection, id: String): IO[List[Project]] = Jdbc.query(c,listSql)(_.setString(1,id))(_.getString(1)).flatMap(rows => rows.traverse(json => IO.fromEither(decode[Project](json))))
