package services.projects.utils
import cats.effect.IO
import cats.syntax.all.*
import java.sql.Connection
import services.projects.objects.*
import services.projects.tables.ProjectTable.ProjectTable
import services.assets.tables.AssetTable.AssetTable
import services.system.api.ApiError
object ProjectEffects:
  def validateAssets(c: Connection, owner: String, in: GameInput): IO[Unit] =
    (in.world.images ++ in.characters.flatMap(_.images)).map(_.assetId).distinct.traverse_(id => AssetTable.find(c,owner,id).flatMap(a => IO.raiseWhen(a.isEmpty)(ApiError("asset_missing","图片不存在或无权使用","images"))))
  def change(c: Connection, owner: String, id: String)(f: (Project,String) => Either[ApiError,Project]): IO[Project] =
    ProjectTable.find(c,owner,id).flatMap(p => IO.realTimeInstant.flatMap(t => IO.fromEither(f(p,t.toString))).flatMap(next => ProjectTable.update(c,p.version,next)))
