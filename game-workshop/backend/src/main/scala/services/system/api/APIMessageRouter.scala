package services.system.api
import cats.effect.IO
import cats.syntax.all.*
import io.circe.Json
import org.http4s.*
import org.http4s.dsl.io.*
import org.http4s.circe.*
import org.typelevel.ci.CIString
import services.system.database.Database
import services.identity.tables.SessionTable.SessionTable
import services.identity.utils.Tokens
object APIMessageRouter:
  private def failure(e: ApiError): IO[Response[IO]] = IO.pure(Response[IO](Status.fromInt(e.status).getOrElse(Status.UnprocessableEntity)).withEntity(Json.obj("code" -> Json.fromString(e.code),"message" -> Json.fromString(e.detail),"field" -> Json.fromString(e.field))))
  def routes(db: Database, endpoints: List[Endpoint]): HttpRoutes[IO] =
    require(endpoints.map(_.name).distinct.size == endpoints.size,"消息路由名重复")
    HttpRoutes.of[IO] {
      case GET -> Root / "health" => db.transaction(c => services.system.database.Jdbc.query(c,"SELECT 1")(_ => ())(_.getInt(1))).flatMap(_ => Ok(Json.obj("status" -> Json.fromString("ok"),"engine" -> Json.fromString("local-template-v1"))))
      case req @ POST -> Root / "api" / name =>
        val action = endpoints.find(_.name == name).fold(IO.raiseError[Json](ApiError("not_found","接口不存在",status=404))) { endpoint =>
          req.body.take(3000001).compile.toVector.flatMap { bytes =>
            if bytes.size > 3000000 then IO.raiseError(ApiError("request_limit","请求过大",status=413))
            else IO.fromEither(io.circe.parser.parse(new String(bytes.toArray,java.nio.charset.StandardCharsets.UTF_8)).left.map(_ => ApiError("invalid_json","JSON格式错误",status=400))).flatMap { json =>
              db.transaction { c =>
                val owner = if !endpoint.protectedRoute then IO.pure(None) else
                  req.headers.get(CIString("Authorization")).map(_.head.value).filter(_.startsWith("Bearer ")).map(_.stripPrefix("Bearer ")).filter(_.length <= 200).fold(IO.raiseError[Option[String]](ApiError("unauthorized","缺少访客会话",status=401)))(token => Tokens.hash(token).flatMap(SessionTable.resolve(c,_)).flatMap(id => if id.nonEmpty then IO.pure(id) else IO.raiseError(ApiError("unauthorized","会话无效",status=401))))
                owner.flatMap(id => endpoint.invoke(json,id,c))
              }
            }
          }
        }
        action.flatMap(Ok(_)).handleErrorWith {
          case e: ApiError => failure(e)
          case _ => failure(ApiError("internal_error","服务暂时不可用，请重试",status=500))
        }
    }
