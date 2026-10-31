package services.identity.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.NoRequestMessage
import services.identity.objects.Session
import services.identity.utils.Tokens
import services.identity.tables.SessionTable.SessionTable
final case class StartSessionMessage() extends NoRequestMessage[Session]:
  def plan(c: Connection): IO[Session] = Tokens.create.flatMap { case (owner, token) => Tokens.hash(token).flatMap(hash => SessionTable.insert(c, owner, hash)).as(Session(owner, token)) }
