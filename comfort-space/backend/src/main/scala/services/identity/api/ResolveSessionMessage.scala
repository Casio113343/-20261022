package services.identity.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.identity.tables.SessionTable.SessionTable
import services.identity.utils.SessionToken
import services.system.api.APIMessage
final case class ResolveSessionMessage(token: String) extends APIMessage[Option[UUID]]:
  def plan(connection: Connection): IO[Option[UUID]] =
    if token.length > 200 then IO.pure(None)
    else SessionToken.hash(token).flatMap(hash => SessionTable.resolve(connection, hash))
