package services.collection.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.collection.tables.FavouriteTable.FavouriteTable
import services.identity.tables.SessionTable.SessionTable
import services.system.api.{APIMessage, ApiError}
import services.system.objects.apiTypes.Acknowledgement
final case class SetFavouriteMessage(ownerId: UUID, id: String, saved: Boolean)
    extends APIMessage[Acknowledgement]:
  def plan(connection: Connection): IO[Acknowledgement] =
    if !Set("rest", "pace", "feel", "ordinary", "unfinished", "worth").contains(id) then
      IO.raiseError(ApiError.invalid("未知卡片。"))
    else
      SessionTable
        .lock(connection, ownerId)
        .flatMap(_ =>
          if saved then FavouriteTable.save(connection, ownerId, id)
          else FavouriteTable.delete(connection, ownerId, id)
        )
        .as(Acknowledgement(true))
