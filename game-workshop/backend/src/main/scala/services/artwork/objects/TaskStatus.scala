package services.artwork.objects
import io.circe.{Decoder,Encoder}
enum TaskStatus:
  case Pending, Running, Blocked, Failed, Succeeded, Obsolete
object TaskStatus:
  def fromString(value: String): Either[String,TaskStatus] = values.find(_.toString.toLowerCase(java.util.Locale.ROOT) == value).toRight("未知美术任务状态")
  given Encoder[TaskStatus] = Encoder.encodeString.contramap(_.toString.toLowerCase(java.util.Locale.ROOT))
  given Decoder[TaskStatus] = Decoder.decodeString.emap(fromString)
