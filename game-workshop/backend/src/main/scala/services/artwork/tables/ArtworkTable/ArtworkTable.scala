package services.artwork.tables.ArtworkTable
import cats.effect.IO
import java.sql.Connection
import io.circe.parser.decode
import io.circe.syntax.*
import services.system.database.Jdbc
import services.system.api.ApiError
import services.artwork.objects.ArtworkManifest
object ArtworkTable:
  private val findSql = "SELECT payload::text FROM workshop_artwork WHERE project_id = ? FOR UPDATE"
  def find(c: Connection, projectId: String): IO[ArtworkManifest] = Jdbc.query(c,findSql)(_.setString(1,projectId))(_.getString(1)).flatMap(rows => rows.headOption.fold(IO.pure(ArtworkManifest(projectId,0,Nil,Nil,Nil)))(json => IO.fromEither(decode[ArtworkManifest](json))))
  private val putSql = "INSERT INTO workshop_artwork(project_id,revision,payload) VALUES(?,?,?::jsonb) ON CONFLICT(project_id) DO UPDATE SET revision = EXCLUDED.revision, payload = EXCLUDED.payload WHERE workshop_artwork.revision = ?"
  def save(c: Connection, previous: Int, state: ArtworkManifest): IO[ArtworkManifest] = Jdbc.execute(c,putSql)(s => {s.setString(1,state.projectId);s.setInt(2,state.revision);s.setString(3,state.asJson.noSpaces);s.setInt(4,previous)}).flatMap(n => if n == 1 then IO.pure(state) else IO.raiseError(ApiError("artwork_conflict","美术版本已更新，请重新加载",status=409)))
