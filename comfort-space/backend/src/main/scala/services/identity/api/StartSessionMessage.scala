package services.identity.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.identity.objects.SessionCredentials
import services.identity.tables.SessionTable.SessionTable
import services.system.api.NoRequestMessage
import services.identity.utils.SessionToken
final case class StartSessionMessage() extends NoRequestMessage[SessionCredentials]:
  def plan(connection: Connection): IO[SessionCredentials] =
    IO.delay((UUID.randomUUID(), UUID.randomUUID().toString + UUID.randomUUID().toString)).flatMap {
      case (id, token) =>
        SessionToken
          .hash(token)
          .flatMap(hash => SessionTable.insert(connection, id, hash))
          .as(SessionCredentials(id, token))
    }
