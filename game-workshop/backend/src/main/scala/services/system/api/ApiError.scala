package services.system.api
final case class ApiError(code: String, detail: String, field: String = "", status: Int = 422) extends RuntimeException(detail)
