package services.journal.api
import cats.effect.IO
import java.sql.Connection
import java.util.UUID
import services.journal.objects.Mood
import services.journal.tables.MoodTable.MoodTable
import services.identity.tables.SessionTable.SessionTable
import services.system.api.{APIMessage, ApiError}
final case class AddMoodMessage(ownerId: UUID, id: UUID, feeling: String, note: String)
    extends APIMessage[Mood]:
  def plan(connection: Connection): IO[Mood] =
    if !Set("还不错", "有点累", "低落", "焦虑", "平静", "说不清").contains(feeling) || note.length > 1000 then
      IO.raiseError(ApiError.invalid("手记格式不正确。"))
    else
      SessionTable
        .lock(connection, ownerId)
        .flatMap(_ => MoodTable.find(connection, ownerId, id))
        .flatMap {
          case Some(existing) if existing.feeling == feeling && existing.note == note.trim =>
            IO.pure(existing)
          case Some(_) => IO.raiseError(ApiError.conflict("手记编号已用于其他内容。"))
          case None =>
            MoodTable.list(connection, ownerId).flatMap { moods =>
              if moods.size >= 500 then IO.raiseError(ApiError.invalid("最多保存 500 篇手记。"))
              else
                IO.realTimeInstant.flatMap { now =>
                  val mood = Mood(id.toString, feeling, note.trim, now.toString)
                  MoodTable
                    .insert(connection, ownerId, mood)
                    .flatMap(inserted =>
                      if inserted then IO.pure(mood) else IO.raiseError(ApiError.notFound)
                    )
                }
            }
        }
