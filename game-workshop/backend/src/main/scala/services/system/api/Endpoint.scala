package services.system.api
import cats.effect.IO
import io.circe.{Json,Decoder,Encoder}
import io.circe.syntax.*
import scala.reflect.ClassTag
import java.sql.Connection
final case class Endpoint(name: String, protectedRoute: Boolean, invoke: (Json,Option[String],Connection) => IO[Json], afterCommit: (Json,Json,Option[String]) => IO[Json] = (result,_,_) => IO.pure(result))
object Endpoint:
  def nameOf[M](using tag: ClassTag[M]): String = tag.runtimeClass.getSimpleName.stripSuffix("Message").toLowerCase(java.util.Locale.ROOT)
  def public[A: Encoder,M <: APIMessage[A]: ClassTag](build: () => M): Endpoint = Endpoint(nameOf[M],false,(_,_,c) => build().plan(c).map(_.asJson))
  def secured[I: Decoder,A: Encoder,M <: APIMessage[A]: ClassTag](build: (String,I) => M): Endpoint = Endpoint(nameOf[M],true,(json,owner,c) =>
    IO.fromEither(json.as[I].left.map(_ => ApiError("invalid_request","请求字段缺失或格式错误",status=400))).flatMap(input => IO.fromOption(owner)(ApiError("unauthorized","请建立访客会话",status=401)).flatMap(id => build(id,input).plan(c).map(_.asJson))))
  // 第一阶段由消息plan持久化任务；连接释放后才执行模型和图片加工。
  def phased[I: Decoder,A: Encoder: Decoder,M <: APIMessage[A]: ClassTag](build: (String,I) => M)(finish: (String,I,A) => IO[A]): Endpoint =
    secured(build).copy(afterCommit=(result,input,owner) =>
      IO.fromOption(owner)(ApiError("unauthorized","缺少可信身份",status=401)).flatMap(id =>
        IO.fromEither(input.as[I]).flatMap(request => IO.fromEither(result.as[A]).flatMap(value => finish(id,request,value).map(_.asJson)))))
