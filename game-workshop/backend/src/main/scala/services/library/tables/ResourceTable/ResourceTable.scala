package services.library.tables.ResourceTable
import cats.effect.IO
import cats.syntax.all.*
import java.sql.Connection
import io.circe.parser.decode
import io.circe.syntax.*
import services.system.database.Jdbc
import services.system.api.ApiError
import services.library.objects.CreativeResource
object ResourceTable:
  private val listSql = "SELECT payload::text FROM workshop_resources WHERE owner_id = ? ORDER BY payload->'history'->-1->>'createdAt' DESC"
  def list(c: Connection, owner: String): IO[List[CreativeResource]] = Jdbc.query(c,listSql)(_.setString(1,owner))(_.getString(1)).flatMap(rows => rows.traverse(s => IO.fromEither(decode[CreativeResource](s))))
  private val findSql = "SELECT payload::text FROM workshop_resources WHERE id = ? AND owner_id = ? FOR UPDATE"
  def find(c: Connection, owner: String, id: String): IO[Option[CreativeResource]] = Jdbc.query(c,findSql)(s => {s.setString(1,id);s.setString(2,owner)})(_.getString(1)).flatMap(_.headOption.fold(IO.pure(Option.empty[CreativeResource]))(s => IO.fromEither(decode[CreativeResource](s)).map(Some(_))))
  private val saveSql = "INSERT INTO workshop_resources(id,owner_id,version,payload) VALUES(?,?,?,?::jsonb) ON CONFLICT(id) DO UPDATE SET version = EXCLUDED.version, payload = EXCLUDED.payload WHERE workshop_resources.owner_id = ? AND workshop_resources.version = ?"
  def save(c: Connection, owner: String, previous: Int, r: CreativeResource): IO[CreativeResource] = Jdbc.execute(c,saveSql)(s => {s.setString(1,r.id);s.setString(2,owner);s.setInt(3,r.version);s.setString(4,r.asJson.noSpaces);s.setString(5,owner);s.setInt(6,previous)}).flatMap(n => if n == 1 then IO.pure(r) else IO.raiseError(ApiError("resource_conflict","资源已更新或标识已被占用，请重新读取",status=409)))
