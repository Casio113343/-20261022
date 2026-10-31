package services.assets.tables.AssetTable
import cats.effect.IO
import java.sql.Connection
import services.system.database.Jdbc
import services.assets.objects.Asset
import java.util.Base64
object AssetTable:
  private val insertSql = "INSERT INTO workshop_assets(id,owner_id,mime,data) VALUES (?,?,?,?)"
  def insert(c: Connection, owner: String, a: Asset, data: Array[Byte]): IO[Unit] = Jdbc.execute(c,insertSql)(s => {s.setString(1,a.id);s.setString(2,owner);s.setString(3,a.mime);s.setBytes(4,data)}).void
  private val findSql = "SELECT mime,data FROM workshop_assets WHERE id = ? AND owner_id = ?"
  def find(c: Connection, owner: String, id: String): IO[Option[Asset]] = Jdbc.query(c,findSql)(s => {s.setString(1,id);s.setString(2,owner)})(r => Asset(id,r.getString(1),Base64.getEncoder.encodeToString(r.getBytes(2)))).map(_.headOption)
