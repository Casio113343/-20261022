package services.system.database
import cats.effect.{IO, Resource}
import java.sql.{Connection, PreparedStatement, ResultSet}
object Jdbc:
  def statement[A](c: Connection, sql: String)(bind: PreparedStatement => Unit)(use: PreparedStatement => A): IO[A] =
    Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(sql))).use(s => IO.blocking { bind(s); use(s) })
  def execute(c: Connection, sql: String)(bind: PreparedStatement => Unit): IO[Int] = statement(c, sql)(bind)(_.executeUpdate())
  def query[A](c: Connection, sql: String)(bind: PreparedStatement => Unit)(read: ResultSet => A): IO[List[A]] =
    Resource.fromAutoCloseable(IO.blocking(c.prepareStatement(sql))).use(s =>
      IO.blocking(bind(s)) *> Resource.fromAutoCloseable(IO.blocking(s.executeQuery())).use(r => IO.blocking {
        Iterator.continually(r.next()).takeWhile(identity).map(_ => read(r)).toList
      }))
