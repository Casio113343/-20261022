package services.identity.utils
import cats.effect.IO
import java.security.{MessageDigest, SecureRandom}
import java.util.{Base64, UUID}
private[identity] object Tokens:
  def create: IO[(String, String)] = IO.blocking {
    val bytes = new Array[Byte](32)
    new SecureRandom().nextBytes(bytes)
    (UUID.randomUUID().toString, Base64.getUrlEncoder.withoutPadding().encodeToString(bytes))
  }
  def hash(token: String): IO[String] = IO.blocking(java.util.HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8))))
