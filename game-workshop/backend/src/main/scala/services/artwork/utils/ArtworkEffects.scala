package services.artwork.utils
import cats.effect.IO
import java.sql.Connection
import services.projects.tables.ProjectTable.ProjectTable
import services.artwork.tables.ArtworkTable.ArtworkTable
import services.artwork.objects.ArtworkManifest
import services.system.api.ApiError
private[artwork] object ArtworkEffects:
  def change(c: Connection, owner: String, projectId: String)(f: ArtworkManifest => Either[ApiError,ArtworkManifest]): IO[ArtworkManifest] =
    ProjectTable.find(c,owner,projectId) *> ArtworkTable.find(c,projectId).flatMap(old => IO.fromEither(f(old)).flatMap(next => if old == next then IO.pure(old) else ArtworkTable.save(c,old.revision,next)))
