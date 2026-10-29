package services.journal.routes
import services.journal.api.*
import services.journal.objects.Mood
import services.journal.objects.apiTypes.*
import services.system.api.ApiEndpoint
import services.system.objects.apiTypes.Acknowledgement
object JournalRoutes:
  val apiMessages: Vector[ApiEndpoint] = Vector(
    ApiEndpoint[AddMoodInput, Mood]("AddMoodMessage")((owner, input) =>
      AddMoodMessage(owner, input.id, input.feeling, input.note)
    ),
    ApiEndpoint[MoodIdInput, Acknowledgement]("DeleteMoodMessage")((owner, input) =>
      DeleteMoodMessage(owner, input.id)
    )
  )
