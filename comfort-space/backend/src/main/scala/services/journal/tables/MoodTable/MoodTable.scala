package services.journal.tables.MoodTable
import cats.effect.IO
import io.circe.parser.decode
import io.circe.syntax.*
import java.sql.Connection
import java.util.UUID
import services.journal.objects.Mood
import services.system.database.Jdbc
object MoodTable:
  private val listSql =
    "SELECT payload::text FROM moods WHERE owner_id = ? ORDER BY updated_at DESC, id"
  def list(connection: Connection, ownerId: UUID): IO[Vector[Mood]] =
    Jdbc
      .statement(connection, listSql)(statement =>
        IO.blocking(statement.setObject(1, ownerId))
          .flatMap(_ => Jdbc.rows(statement)(_.getString(1)))
      )
      .flatMap(
        _.foldLeft(IO.pure(Vector.empty[Mood]))((acc, text) =>
          acc.flatMap(values => IO.fromEither(decode[Mood](text)).map(values :+ _))
        )
      )
  private val findSql = "SELECT payload::text FROM moods WHERE id = ? AND owner_id = ?"
  def find(connection: Connection, ownerId: UUID, id: UUID): IO[Option[Mood]] =
    Jdbc
      .statement(connection, findSql)(statement =>
        IO.blocking { statement.setObject(1, id); statement.setObject(2, ownerId) }
          .flatMap(_ => Jdbc.rows(statement)(_.getString(1)))
      )
      .flatMap(
        _.headOption.fold(IO.pure(Option.empty[Mood]))(text =>
          IO.fromEither(decode[Mood](text)).map(Some(_))
        )
      )
  private val insertSql =
    "INSERT INTO moods(id, owner_id, payload) VALUES (?, ?, ?::jsonb) ON CONFLICT(id) DO NOTHING"
  def insert(connection: Connection, ownerId: UUID, value: Mood): IO[Boolean] =
    Jdbc.statement(connection, insertSql)(statement =>
      IO.blocking {
        statement.setObject(1, UUID.fromString(value.id)); statement.setObject(2, ownerId);
        statement.setString(3, value.asJson.noSpaces)
      }.flatMap(_ => Jdbc.update(statement))
        .map(_ == 1)
    )
  private val deleteSql = "DELETE FROM moods WHERE id = ? AND owner_id = ?"
  def delete(connection: Connection, ownerId: UUID, id: UUID): IO[Boolean] =
    Jdbc.statement(connection, deleteSql)(statement =>
      IO.blocking { statement.setObject(1, id); statement.setObject(2, ownerId) }
        .flatMap(_ => Jdbc.update(statement))
        .map(_ == 1)
    )
  private val clearSql = "DELETE FROM moods WHERE owner_id = ?"
  def clear(connection: Connection, ownerId: UUID): IO[Unit] =
    Jdbc.statement(connection, clearSql)(statement =>
      IO.blocking(statement.setObject(1, ownerId)).flatMap(_ => Jdbc.update(statement)).void
    )
