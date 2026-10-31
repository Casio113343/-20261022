package services.catalog.api
import cats.effect.IO
import java.sql.Connection
import services.system.api.NoRequestMessage
import services.catalog.objects.Genre
import services.catalog.utils.Catalog
final case class ListGenresMessage() extends NoRequestMessage[List[Genre]]:
  def plan(c: Connection): IO[List[Genre]] = IO.pure(Catalog.all)
