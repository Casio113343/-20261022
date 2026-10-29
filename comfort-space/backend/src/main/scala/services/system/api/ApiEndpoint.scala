package services.system.api
import cats.effect.IO
import io.circe.{Decoder, Encoder, Json}
import io.circe.syntax.*
import java.sql.Connection
import java.util.UUID
final case class ApiEndpoint(name: String, run: (UUID, Json, Connection) => IO[Json])
object ApiEndpoint:
  def routeName(messageName: String): String =
    messageName.stripSuffix("Message").toLowerCase(java.util.Locale.ROOT)
  def apply[A: Decoder, B: Encoder](messageName: String)(
      build: (UUID, A) => APIMessage[B]
  ): ApiEndpoint =
    new ApiEndpoint(
      routeName(messageName),
      (owner, json, connection) =>
        IO.fromEither(json.as[A].left.map(_ => ApiError.invalid("请求字段不正确。")))
          .flatMap(input => build(owner, input).plan(connection))
          .map(_.asJson)
    )
  def noRequest[B: Encoder](messageName: String)(build: UUID => APIMessage[B]): ApiEndpoint =
    new ApiEndpoint(
      routeName(messageName),
      (owner, _, connection) => build(owner).plan(connection).map(_.asJson)
    )
