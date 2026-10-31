package services.catalog.routes
import services.system.api.Endpoint
import services.catalog.api.ListGenresMessage
object CatalogRoutes:
  val apiMessages = List(Endpoint.public(() => ListGenresMessage()))
