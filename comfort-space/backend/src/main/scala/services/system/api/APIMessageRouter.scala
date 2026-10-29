package services.system.api
import cats.effect.IO
import cats.syntax.all.*
import io.circe.Json
import java.util.UUID
import org.http4s.*
import org.http4s.circe.*
import org.http4s.dsl.io.*
import org.http4s.server.middleware.EntityLimiter
import org.typelevel.ci.CIString
import services.identity.api.{ResolveSessionMessage, StartSessionMessage}
import services.identity.tables.PreferencesTable.PreferencesTable
import services.system.database.Database
object APIMessageRouter:
  private val cookieName = "qiyu_session"
  private val startSessionRoute = ApiEndpoint.routeName("StartSessionMessage")
  private def cookie(token: String, remember: Boolean): ResponseCookie =
    ResponseCookie(
      cookieName,
      token,
      path = Some("/api"),
      httpOnly = true,
      sameSite = Some(SameSite.Strict),
      maxAge = if remember then Some(604800L) else None
    )
  private def token(request: Request[IO]): Option[String] =
    request.cookies.find(_.name == cookieName).map(_.content)
  private def authorize(request: Request[IO], database: Database): IO[UUID] =
    token(request).fold(IO.raiseError[UUID](ApiError(401, "unauthorized", "请先连接访客会话。")))(value =>
      database
        .transact(ResolveSessionMessage(value).plan)
        .flatMap(
          _.fold(IO.raiseError[UUID](ApiError(401, "unauthorized", "访客身份已过期，请重新连接。")))(IO.pure)
        )
    )
  private def verifyOrigin(request: Request[IO], allowedOrigins: Set[String]): IO[Unit] =
    val origin = request.headers.get(CIString("Origin")).map(_.head.value)
    val crossSite =
      request.headers.get(CIString("Sec-Fetch-Site")).exists(_.head.value == "cross-site")
    if crossSite || origin.exists(value => !allowedOrigins.contains(value)) then
      IO.raiseError(ApiError(403, "origin_rejected", "请求来源不被允许。"))
    else IO.unit
  private def handleError(error: Throwable): IO[Response[IO]] = error match
    case _: EntityLimiter.EntityTooLarge =>
      IO.pure(
        Response[IO](Status.PayloadTooLarge).withEntity(
          Json.obj(
            "code" -> Json.fromString("payload_too_large"),
            "message" -> Json.fromString("请求内容过大，请缩短后重试。")
          )
        )
      )
    case ApiError(status, code, message) =>
      val responseStatus = Status.fromInt(status).getOrElse(Status.InternalServerError)
      IO.pure(
        Response[IO](responseStatus).withEntity(
          Json.obj("code" -> Json.fromString(code), "message" -> Json.fromString(message))
        )
      )
    case _: MessageFailure =>
      BadRequest(
        Json.obj(
          "code" -> Json.fromString("invalid_json"),
          "message" -> Json.fromString("请求必须是合法 JSON。")
        )
      )
    case _ =>
      InternalServerError(
        Json.obj(
          "code" -> Json.fromString("server_error"),
          "message" -> Json.fromString("服务暂时不可用，内容可能尚未保存，请稍后重试。")
        )
      )
  def routes(
      database: Database,
      endpoints: Vector[ApiEndpoint],
      allowedOrigins: Set[String]
  ): HttpRoutes[IO] =
    val registered = endpoints.map(endpoint => endpoint.name -> endpoint).toMap
    HttpRoutes
      .of[IO] {
        case GET -> Root / "api" / "health" =>
          Ok(Json.obj("status" -> Json.fromString("ok"), "mode" -> Json.fromString("server-demo")))
        case request @ POST -> Root / "api" / `startSessionRoute` =>
          verifyOrigin(request, allowedOrigins)
            .flatMap(_ => request.as[Json])
            .flatMap(json =>
              if json.asObject.exists(_.isEmpty) then IO.unit
              else IO.raiseError(ApiError.invalid("初始化会话不接受业务输入字段。"))
            )
            .flatMap { _ =>
              val existing = token(request)
                .traverse(value => database.transact(ResolveSessionMessage(value).plan))
                .map(_.flatten)
              existing.flatMap {
                case Some(owner) =>
                  database
                    .transact(connection => PreferencesTable.find(connection, owner))
                    .flatMap(preferences =>
                      Ok(Json.obj("mode" -> Json.fromString("server-demo"))).map(response =>
                        token(request).fold(response)(value =>
                          response.addCookie(cookie(value, preferences.remember))
                        )
                      )
                    )
                case None =>
                  database
                    .transact(StartSessionMessage().plan)
                    .flatMap(credentials =>
                      Ok(Json.obj("mode" -> Json.fromString("server-demo")))
                        .map(_.addCookie(cookie(credentials.token, false)))
                    )
              }
            }
            .handleErrorWith(handleError)
        case request @ POST -> Root / "api" / name =>
          verifyOrigin(request, allowedOrigins)
            .flatMap(_ => authorize(request, database))
            .flatMap { owner =>
              registered.get(name).fold(IO.raiseError[Response[IO]](ApiError.notFound)) {
                endpoint =>
                  request
                    .as[Json]
                    .flatMap(json =>
                      database.transact(connection => endpoint.run(owner, json, connection))
                    )
                    .flatMap(Ok(_))
                    .flatMap { response =>
                      if Set("updatepreferences", "cleardata").contains(name) then
                        database
                          .transact(connection => PreferencesTable.find(connection, owner))
                          .map(preferences =>
                            token(request).fold(response)(value =>
                              response.addCookie(cookie(value, preferences.remember))
                            )
                          )
                      else IO.pure(response)
                    }
              }
            }
            .handleErrorWith(handleError)
      }
      .map(response => response.putHeaders(Header.Raw(CIString("Cache-Control"), "no-store")))
