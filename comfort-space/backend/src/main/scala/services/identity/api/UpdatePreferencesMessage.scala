package services.identity.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.identity.objects.Preferences
import services.identity.tables.PreferencesTable.PreferencesTable
import services.identity.tables.SessionTable.SessionTable
import services.system.api.{APIMessage, ApiError}
final case class UpdatePreferencesMessage(ownerId: UUID, preferences: Preferences)
    extends APIMessage[Preferences]:
  def plan(connection: Connection): IO[Preferences] =
    if preferences.nickname.length > 20 then IO.raiseError(ApiError.invalid("称呼最多 20 个字符。"))
    else
      SessionTable
        .lock(connection, ownerId)
        .flatMap(_ => PreferencesTable.save(connection, ownerId, preferences))
        .as(preferences)
