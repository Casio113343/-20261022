package services.system.generation
import cats.effect.IO
import java.net.URI
import java.net.http.{HttpClient,HttpRequest,HttpResponse}
import java.time.Duration
import io.circe.Json
import io.circe.syntax.*
import io.circe.parser.decode
import services.generation.objects.*
import services.assets.objects.Asset
import services.system.api.ApiError
// 可配置的自托管模型网关协议，供应商适配由网关完成，不假定某厂商接口兼容。
final case class HttpGenerationProvider(endpoint: Option[String], token: Option[String], client: HttpClient) extends GenerationProvider:
  def configured: Boolean = endpoint.nonEmpty
  def generate(input: GenerationInput, references: List[Asset], original: Option[Asset]): IO[GenerationOutput] = IO.fromOption(endpoint)(ApiError("provider_missing","模型网关尚未配置")).flatMap { url =>
    IO.blocking {
      val uri = URI.create(url)
      if uri.getScheme != "https" && !(uri.getScheme == "http" && Set("127.0.0.1","localhost").contains(uri.getHost)) then throw ApiError("invalid_provider_url","网关需要HTTPS或本地HTTP")
      val body = Json.obj("request" -> input.asJson,"references" -> references.asJson,"original" -> original.asJson).noSpaces
      val builder = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(90)).header("Content-Type","application/json").POST(HttpRequest.BodyPublishers.ofString(body))
      token.foreach(t => builder.header("Authorization",s"Bearer $t"))
      val response = client.send(builder.build(),HttpResponse.BodyHandlers.ofInputStream())
      response
    }.flatMap { response => cats.effect.Resource.fromAutoCloseable(IO.pure(response.body())).use(stream => IO.blocking {
      if response.statusCode() != 200 then throw ApiError("provider_failed","模型网关返回失败")
      val bytes = stream.readNBytes(18000001)
      if bytes.length > 18000000 then throw ApiError("provider_limit","模型结果过大")
      new String(bytes,java.nio.charset.StandardCharsets.UTF_8)
    }).flatMap(s => IO.fromEither(decode[GenerationOutput](s).left.map(_ => ApiError("invalid_model_output","模型结果格式不符合协议")))) }
  }
