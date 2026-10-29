package services.identity.tables.PreferencesTable
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.identity.objects.Preferences
import services.system.database.Jdbc
object PreferencesTable:
  private val findSql =
    "SELECT nickname, remember, reduced_motion FROM preferences WHERE owner_id = ?"
  def find(connection: Connection, ownerId: UUID): IO[Preferences] =
    Jdbc
      .statement(connection, findSql)(statement =>
        IO.blocking(statement.setObject(1, ownerId))
          .flatMap(_ =>
            Jdbc.rows(statement)(r => Preferences(r.getString(1), r.getBoolean(2), r.getBoolean(3)))
          )
      )
      .map(_.headOption.getOrElse(Preferences("", false, false)))
  private val saveSql = """INSERT INTO preferences(owner_id, nickname, remember, reduced_motion) VALUES (?, ?, ?, ?)
    ON CONFLICT(owner_id) DO UPDATE SET nickname=EXCLUDED.nickname, remember=EXCLUDED.remember, reduced_motion=EXCLUDED.reduced_motion"""
  def save(connection: Connection, ownerId: UUID, value: Preferences): IO[Unit] =
    Jdbc.statement(connection, saveSql)(statement =>
      IO.blocking {
        statement.setObject(1, ownerId); statement.setString(2, value.nickname);
        statement.setBoolean(3, value.remember); statement.setBoolean(4, value.reducedMotion)
      }.flatMap(_ => Jdbc.update(statement))
        .void
    )
