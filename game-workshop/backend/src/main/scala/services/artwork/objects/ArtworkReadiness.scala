package services.artwork.objects
final case class ArtworkReadiness(manifest: ArtworkManifest, ready: Boolean, bindings: List[ArtworkBinding], hasFailures: Boolean)
object ArtworkReadiness:
  given io.circe.Decoder[ArtworkReadiness] = io.circe.generic.semiauto.deriveDecoder
  given io.circe.Encoder[ArtworkReadiness] = io.circe.generic.semiauto.deriveEncoder
