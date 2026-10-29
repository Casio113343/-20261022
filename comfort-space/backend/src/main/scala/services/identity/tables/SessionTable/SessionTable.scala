package services.identity.tables.SessionTable
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.system.database.Jdbc
import services.system.api.ApiError
object SessionTable:
  private val insertSql =
    "INSERT INTO visitor_sessions(id, token_hash, expires_at) VALUES (?, ?, now() + interval '7 days')"
  def insert(connection: Connection, id: UUID, tokenHash: String): IO[Unit] =
    Jdbc.statement(connection, insertSql)(statement =>
      IO.blocking {
        statement.setObject(1, id); statement.setString(2, tokenHash)
      }.flatMap(_ => Jdbc.update(statement))
        .void
    )
  private val resolveSql =
    "SELECT id FROM visitor_sessions WHERE token_hash = ? AND expires_at > now()"
  def resolve(connection: Connection, tokenHash: String): IO[Option[UUID]] =
    Jdbc.statement(connection, resolveSql)(statement =>
      IO.blocking(statement.setString(1, tokenHash))
        .flatMap(_ => Jdbc.rows(statement)(r => r.getObject("id", classOf[UUID])))
        .map(_.headOption)
    )
  // 每个访客的短写事务串行化，跨连接/进程同样生效，不依赖内存锁。
  private val lockSql =
    "SELECT id FROM visitor_sessions WHERE id = ? AND expires_at > now() FOR UPDATE"
  def lock(connection: Connection, ownerId: UUID): IO[Unit] =
    Jdbc.statement(connection, lockSql)(statement =>
      IO.blocking(statement.setObject(1, ownerId))
        .flatMap(_ => Jdbc.rows(statement)(_.getString(1)))
        .flatMap(rows =>
          if rows.nonEmpty then IO.unit
          else IO.raiseError(ApiError(401, "session_expired", "访客身份已过期，请重新连接。"))
        )
    )
  private val purgeSql = "DELETE FROM visitor_sessions WHERE expires_at <= now()"
  def purgeExpired(connection: Connection): IO[Unit] =
    Jdbc.statement(connection, purgeSql)(Jdbc.update).void
  private val deleteSql = "DELETE FROM visitor_sessions WHERE id = ?"
  def delete(connection: Connection, ownerId: UUID): IO[Unit] =
    Jdbc.statement(connection, deleteSql)(statement =>
      IO.blocking(statement.setObject(1, ownerId)).flatMap(_ => Jdbc.update(statement)).void
    )
