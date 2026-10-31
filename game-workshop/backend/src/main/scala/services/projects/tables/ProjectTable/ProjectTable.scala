package services.projects.tables.ProjectTable
import cats.effect.IO
import java.sql.Connection
import io.circe.parser.decode
import io.circe.syntax.*
import services.projects.objects.Project
import services.system.database.Jdbc
import services.system.api.ApiError
object ProjectTable:
  private def parse(json: String): Project = decode[Project](json).fold(e => throw e, identity)
  private val insertSql = "INSERT INTO workshop_projects(id, owner_id, request_id, version, payload) VALUES (?, ?, ?, ?, ?::jsonb) ON CONFLICT(owner_id, request_id) DO NOTHING"
  def insert(c: Connection, requestId: String, p: Project): IO[Unit] = Jdbc.execute(c, insertSql)(s => {s.setString(1,p.id);s.setString(2,p.ownerId);s.setString(3,requestId);s.setInt(4,p.version);s.setString(5,p.asJson.noSpaces)}).void
  private val findRequestSql = "SELECT payload::text FROM workshop_projects WHERE owner_id = ? AND request_id = ?"
  def findRequest(c: Connection, owner: String, requestId: String): IO[Option[Project]] = Jdbc.query(c,findRequestSql)(s => {s.setString(1,owner);s.setString(2,requestId)})(r => parse(r.getString(1))).map(_.headOption)
  private val findSql = "SELECT payload::text FROM workshop_projects WHERE id = ? AND owner_id = ? FOR UPDATE"
  def find(c: Connection, owner: String, id: String): IO[Project] = Jdbc.query(c,findSql)(s => {s.setString(1,id);s.setString(2,owner)})(r => parse(r.getString(1))).flatMap(_.headOption.fold(IO.raiseError[Project](ApiError("not_found","作品不存在或无权访问",status=404)))(IO.pure))
  private val listSql = "SELECT payload::text FROM workshop_projects WHERE owner_id = ? ORDER BY payload->>'updatedAt' DESC LIMIT 100"
  def list(c: Connection, owner: String): IO[List[Project]] = Jdbc.query(c,listSql)(_.setString(1,owner))(r => parse(r.getString(1)))
  private val updateSql = "UPDATE workshop_projects SET version = ?, payload = ?::jsonb WHERE id = ? AND owner_id = ? AND version = ?"
  def update(c: Connection, previous: Int, p: Project): IO[Project] = Jdbc.execute(c,updateSql)(s => {s.setInt(1,p.version);s.setString(2,p.asJson.noSpaces);s.setString(3,p.id);s.setString(4,p.ownerId);s.setInt(5,previous)}).flatMap(n => if n == 1 then IO.pure(p) else IO.raiseError(ApiError("version_conflict","资料已更新，请重新加载",status=409)))
  private val deleteSql = "DELETE FROM workshop_projects WHERE id = ? AND owner_id = ?"
  def delete(c: Connection, owner: String, id: String): IO[Unit] = Jdbc.execute(c,deleteSql)(s => {s.setString(1,id);s.setString(2,owner)}).void
