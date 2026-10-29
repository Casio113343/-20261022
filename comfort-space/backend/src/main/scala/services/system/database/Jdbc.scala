package services.system.database
import cats.effect.{IO, Resource}
import java.sql.{Connection, PreparedStatement, ResultSet}
object Jdbc:
  def statement[A](connection: Connection, sql: String)(use: PreparedStatement => IO[A]): IO[A] =
    Resource.fromAutoCloseable(IO.blocking(connection.prepareStatement(sql))).use(use)
  def rows[A](statement: PreparedStatement)(read: ResultSet => A): IO[Vector[A]] =
    Resource.fromAutoCloseable(IO.blocking(statement.executeQuery())).use { result =>
      def next(acc: Vector[A]): IO[Vector[A]] =
        IO.blocking(result.next())
          .flatMap(hasNext =>
            if hasNext then IO.blocking(read(result)).flatMap(value => IO.defer(next(acc :+ value)))
            else IO.pure(acc)
          )
      next(Vector.empty)
    }
  def update(statement: PreparedStatement): IO[Int] = IO.blocking(statement.executeUpdate())
