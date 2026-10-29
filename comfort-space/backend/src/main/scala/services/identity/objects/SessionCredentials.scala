package services.identity.objects
import java.util.UUID
final case class SessionCredentials(ownerId: UUID, token: String)
