package services.collection.routes
import services.collection.api.SetFavouriteMessage
import services.collection.objects.apiTypes.SetFavouriteInput
import services.system.api.ApiEndpoint
import services.system.objects.apiTypes.Acknowledgement
object CollectionRoutes:
  val apiMessages: Vector[ApiEndpoint] = Vector(
    ApiEndpoint[SetFavouriteInput, Acknowledgement]("SetFavouriteMessage")((owner, input) =>
      SetFavouriteMessage(owner, input.id, input.saved)
    )
  )
