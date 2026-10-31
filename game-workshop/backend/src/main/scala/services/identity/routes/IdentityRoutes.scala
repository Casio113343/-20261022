package services.identity.routes
import services.system.api.Endpoint
import services.identity.api.StartSessionMessage
object IdentityRoutes:
  val apiMessages = List(Endpoint.public(() => StartSessionMessage()))
