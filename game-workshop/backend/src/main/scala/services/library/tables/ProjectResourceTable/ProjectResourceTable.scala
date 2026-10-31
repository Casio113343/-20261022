package services.library.tables.ProjectResourceTable
import cats.effect.IO
import cats.syntax.all.*
import java.sql.Connection
import io.circe.parser.decode
import io.circe.syntax.*
import services.system.database.Jdbc
import services.library.objects.ResourceLink
object ProjectResourceTable:
  private val listSql = "SELECT payload::text FROM workshop_project_resources WHERE project_id = ? ORDER BY target"
  def list(c: Connection, projectId: String): IO[List[ResourceLink]] = Jdbc.query(c,listSql)(_.setString(1,projectId))(_.getString(1)).flatMap(_.traverse(s => IO.fromEither(decode[ResourceLink](s))))
  private val putSql = "INSERT INTO workshop_project_resources(project_id,target,payload) VALUES(?,?,?::jsonb) ON CONFLICT(project_id,target) DO UPDATE SET payload = EXCLUDED.payload"
  def save(c: Connection, projectId: String, link: ResourceLink): IO[Unit] = Jdbc.execute(c,putSql)(s => {s.setString(1,projectId);s.setString(2,link.target);s.setString(3,link.asJson.noSpaces)}).void
