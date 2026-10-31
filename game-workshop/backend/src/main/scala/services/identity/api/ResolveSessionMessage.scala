package services.identity.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.APIMessage
import services.identity.tables.SessionTable.SessionTable
import services.identity.utils.Tokens
final case class ResolveSessionMessage(token: String) extends APIMessage[Option[String]]:
  def plan(c: Connection): IO[Option[String]] = Tokens.hash(token).flatMap(SessionTable.resolve(c,_))
