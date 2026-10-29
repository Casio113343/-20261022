package services.conversations.tables.ConversationTable
import cats.effect.IO
import io.circe.parser.decode
import io.circe.syntax.*
import java.sql.Connection
import java.util.UUID
import services.conversations.objects.Conversation
import services.system.database.Jdbc
object ConversationTable:
  private val listSql =
    "SELECT payload::text FROM conversations WHERE owner_id = ? ORDER BY updated_at DESC, id"
  def list(connection: Connection, ownerId: UUID): IO[Vector[Conversation]] =
    Jdbc
      .statement(connection, listSql)(statement =>
        IO.blocking(statement.setObject(1, ownerId))
          .flatMap(_ => Jdbc.rows(statement)(_.getString(1)))
      )
      .flatMap(
        _.foldLeft(IO.pure(Vector.empty[Conversation]))((acc, text) =>
          acc.flatMap(values => IO.fromEither(decode[Conversation](text)).map(values :+ _))
        )
      )
  private val findSql = "SELECT payload::text FROM conversations WHERE id = ? AND owner_id = ?"
  def find(connection: Connection, ownerId: UUID, id: UUID): IO[Option[Conversation]] =
    Jdbc
      .statement(connection, findSql)(statement =>
        IO.blocking { statement.setObject(1, id); statement.setObject(2, ownerId) }
          .flatMap(_ => Jdbc.rows(statement)(_.getString(1)))
      )
      .flatMap(
        _.headOption.fold(IO.pure(Option.empty[Conversation]))(text =>
          IO.fromEither(decode[Conversation](text)).map(Some(_))
        )
      )
  private val insertSql =
    "INSERT INTO conversations(id, owner_id, payload) VALUES (?, ?, ?::jsonb) ON CONFLICT(id) DO NOTHING"
  def insert(connection: Connection, ownerId: UUID, value: Conversation): IO[Boolean] =
    Jdbc.statement(connection, insertSql)(statement =>
      IO.blocking {
        statement.setObject(1, UUID.fromString(value.id)); statement.setObject(2, ownerId);
        statement.setString(3, value.asJson.noSpaces)
      }.flatMap(_ => Jdbc.update(statement))
        .map(_ == 1)
    )
  private val deleteSql = "DELETE FROM conversations WHERE id = ? AND owner_id = ?"
  def delete(connection: Connection, ownerId: UUID, id: UUID): IO[Boolean] =
    Jdbc.statement(connection, deleteSql)(statement =>
      IO.blocking { statement.setObject(1, id); statement.setObject(2, ownerId) }
        .flatMap(_ => Jdbc.update(statement))
        .map(_ == 1)
    )
  private val clearSql = "DELETE FROM conversations WHERE owner_id = ?"
  def clear(connection: Connection, ownerId: UUID): IO[Unit] =
    Jdbc.statement(connection, clearSql)(statement =>
      IO.blocking(statement.setObject(1, ownerId)).flatMap(_ => Jdbc.update(statement)).void
    )

  private val saveSql =
    "UPDATE conversations SET payload = ?::jsonb, revision = ?, updated_at = now() WHERE id = ? AND owner_id = ? AND revision = ?"
  def save(
      connection: Connection,
      ownerId: UUID,
      value: Conversation,
      expectedRevision: Long
  ): IO[Boolean] =
    Jdbc.statement(connection, saveSql)(statement =>
      IO.blocking {
        statement.setString(1, value.asJson.noSpaces); statement.setLong(2, value.revision)
        statement.setObject(3, UUID.fromString(value.id)); statement.setObject(4, ownerId);
        statement.setLong(5, expectedRevision)
      }.flatMap(_ => Jdbc.update(statement))
        .map(_ == 1)
    )
