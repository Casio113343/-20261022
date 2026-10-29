package services.system.api
final case class ApiError(status: Int, code: String, publicMessage: String)
    extends RuntimeException(publicMessage)
object ApiError:
  val notFound = ApiError(404, "not_found", "内容不存在或不属于当前访客。")
  def invalid(message: String): ApiError = ApiError(400, "invalid_input", message)
  def conflict(message: String): ApiError = ApiError(409, "conflict", message)
