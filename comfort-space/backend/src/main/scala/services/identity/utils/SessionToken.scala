package services.identity.utils
import cats.effect.IO
import java.nio.charset.StandardCharsets
import java.security.MessageDigest
private[identity] object SessionToken:
  def hash(token: String): IO[String] = IO.delay(
    MessageDigest
      .getInstance("SHA-256")
      .digest(token.getBytes(StandardCharsets.UTF_8))
      .map(b => f"${b & 0xff}%02x")
      .mkString
  )
