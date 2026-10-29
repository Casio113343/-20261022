package services.collection.tables.FavouriteTable
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.system.database.Jdbc
object FavouriteTable:
  private val listSql = "SELECT card_id FROM favourites WHERE owner_id = ? ORDER BY card_id"
  def list(connection: Connection, ownerId: UUID): IO[Vector[String]] =
    Jdbc.statement(connection, listSql)(statement =>
      IO.blocking(statement.setObject(1, ownerId))
        .flatMap(_ => Jdbc.rows(statement)(_.getString(1)))
    )
  private val saveSql =
    "INSERT INTO favourites(owner_id, card_id) VALUES (?, ?) ON CONFLICT DO NOTHING"
  def save(connection: Connection, ownerId: UUID, id: String): IO[Unit] =
    Jdbc.statement(connection, saveSql)(statement =>
      IO.blocking { statement.setObject(1, ownerId); statement.setString(2, id) }
        .flatMap(_ => Jdbc.update(statement))
        .void
    )
  private val deleteSql = "DELETE FROM favourites WHERE owner_id = ? AND card_id = ?"
  def delete(connection: Connection, ownerId: UUID, id: String): IO[Unit] =
    Jdbc.statement(connection, deleteSql)(statement =>
      IO.blocking { statement.setObject(1, ownerId); statement.setString(2, id) }
        .flatMap(_ => Jdbc.update(statement))
        .void
    )
  private val clearSql = "DELETE FROM favourites WHERE owner_id = ?"
  def clear(connection: Connection, ownerId: UUID): IO[Unit] =
    Jdbc.statement(connection, clearSql)(statement =>
      IO.blocking(statement.setObject(1, ownerId)).flatMap(_ => Jdbc.update(statement)).void
    )
