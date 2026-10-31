package services.identity.tables.SessionTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
object SessionTable:
  private val insertSql = "INSERT INTO workshop_sessions(owner_id, token_hash) VALUES (?, ?)"
  def insert(c: Connection, owner: String, hash: String): IO[Unit] = Jdbc.execute(c, insertSql)(s => {s.setString(1, owner); s.setString(2, hash)}).void
  private val resolveSql = "SELECT owner_id FROM workshop_sessions WHERE token_hash = ?"
  def resolve(c: Connection, hash: String): IO[Option[String]] = Jdbc.query(c, resolveSql)(_.setString(1, hash))(_.getString(1)).map(_.headOption)
