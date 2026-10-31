package services.system.database
import cats.effect.{IO, Resource}
import cats.effect.kernel.Resource.ExitCase
import java.sql.{Connection, DriverManager}
final case class Database(url: String, user: String, password: String):
  def transaction[A](f: Connection => IO[A]): IO[A] =
    Resource.fromAutoCloseable(IO.blocking(DriverManager.getConnection(url, user, password))).use(c =>
      IO.blocking(c.setAutoCommit(false)) *> f(c).guaranteeCase {
        case cats.effect.kernel.Outcome.Succeeded(_) => IO.blocking(c.commit())
        case _ => IO.blocking(c.rollback())
      })
