package services.system
import cats.effect.{IO,IOApp,Resource}
import java.sql.DriverManager
import services.system.database.Jdbc
object CreateDevelopmentDatabase extends IOApp.Simple:
  def run: IO[Unit] = IO.delay(sys.env).flatMap { env =>
    Resource.fromAutoCloseable(IO.blocking(DriverManager.getConnection("jdbc:postgresql://127.0.0.1:55433/postgres","workshop",env.getOrElse("DATABASE_PASSWORD","")))).use { c =>
      Jdbc.query(c,"SELECT 1 FROM pg_database WHERE datname = 'workshop'")(_ => ())(_.getInt(1)).flatMap(rows => if rows.nonEmpty then IO.unit else Jdbc.execute(c,"CREATE DATABASE workshop")(_ => ()).void)
    }
  }
