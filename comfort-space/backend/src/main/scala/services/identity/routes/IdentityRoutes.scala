package services.identity.routes
import services.identity.api.*
import services.identity.objects.Preferences
import services.identity.objects.apiTypes.*
import services.system.api.ApiEndpoint
import services.system.objects.apiTypes.Acknowledgement
object IdentityRoutes:
  val apiMessages: Vector[ApiEndpoint] = Vector(
    ApiEndpoint.noRequest[SavedState]("GetStateMessage")(GetStateMessage.apply),
    ApiEndpoint.noRequest[Acknowledgement]("ClearDataMessage")(ClearDataMessage.apply),
    ApiEndpoint[UpdatePreferencesInput, Preferences]("UpdatePreferencesMessage")((owner, input) =>
      UpdatePreferencesMessage(owner, input.preferences)
    )
  )
