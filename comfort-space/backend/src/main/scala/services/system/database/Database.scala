package services.system.database
import cats.effect.{IO, Resource, Outcome}
import com.zaxxer.hikari.{HikariConfig, HikariDataSource}
import java.sql.Connection
final class Database private (pool: HikariDataSource):
  def transact[A](run: Connection => IO[A]): IO[A] =
    Resource.fromAutoCloseable(IO.blocking(pool.getConnection())).use { connection =>
      IO.blocking(connection.setAutoCommit(false))
        .flatMap(_ =>
          run(connection)
            .flatTap(_ => IO.blocking(connection.commit()))
            .onError { case _ => IO.blocking(connection.rollback()) }
            .guaranteeCase {
              case Outcome.Canceled() => IO.blocking(connection.rollback())
              case _                  => IO.unit
            }
        )
    }
object Database:
  def resource(url: String, user: String, password: String): Resource[IO, Database] =
    Resource
      .make(IO.blocking {
        val config = new HikariConfig()
        config.setJdbcUrl(url)
        config.setUsername(user)
        config.setPassword(password)
        config.setMaximumPoolSize(6)
        config.setConnectionTimeout(5000)
        config.setPoolName("qiyu-database")
        new HikariDataSource(config)
      })(pool => IO.blocking(pool.close()))
      .map(new Database(_))
