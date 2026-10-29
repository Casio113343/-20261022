package services.system

import cats.effect.{IO, IOApp, Resource}
import java.sql.DriverManager
import services.system.database.Jdbc

/** 仅供项目专属本机开发集群使用；正式环境由部署者创建数据库。 */
object CreateDevelopmentDatabase extends IOApp.Simple:
  def run: IO[Unit] = IO.delay(sys.env).flatMap { env =>
    val password = env
      .get("QIYU_DB_PASSWORD")
      .toRight(new IllegalArgumentException("QIYU_DB_PASSWORD is required"))
    IO.fromEither(password).flatMap { secret =>
      val url = env
        .getOrElse("QIYU_DB_URL", "jdbc:postgresql://127.0.0.1:55432/qiyu")
        .stripSuffix("/qiyu") + "/postgres"
      Resource
        .fromAutoCloseable(
          IO.blocking(
            DriverManager.getConnection(url, env.getOrElse("QIYU_DB_USER", "qiyu"), secret)
          )
        )
        .use { connection =>
          Jdbc
            .statement(connection, "SELECT 1 FROM pg_database WHERE datname = 'qiyu'")(statement =>
              Jdbc.rows(statement)(_.getInt(1))
            )
            .flatMap { rows =>
              if rows.nonEmpty then IO.unit
              else Jdbc.statement(connection, "CREATE DATABASE qiyu")(Jdbc.update).void
            }
        }
    }
  }
