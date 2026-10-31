package services.library.utils
import services.library.objects.*
import services.projects.objects.GameInput
import services.system.api.ApiError
private[library] object ResourceRules:
  val kinds: Set[String] = Set("character","world","skill","asset","edit","promo")
  def validate(d: ResourceData): Either[ApiError,Unit] =
    if !kinds(d.kind) || d.title.trim.isEmpty || d.title.length > 120 || d.description.length > 6000 || d.content.length > 6000 then Left(ApiError("invalid_resource","请选择有效服务，填写名称；名称最多120字，说明每项最多6000字"))
    else if d.kind == "world" && d.world.isEmpty || d.kind == "character" && d.character.isEmpty then Left(ApiError("resource_content_required","请填写对应世界观或人物资料"))
    else Right(())
  def importInput(in: GameInput, r: CreativeResource, v: ResourceVersion, target: String): Either[ApiError,GameInput] =
    if target == "world" && v.data.kind == "world" then v.data.world.toRight(ApiError("resource_content_required","缺少世界观")).map(w => in.copy(world=w))
    else if target.startsWith("character:") && v.data.kind == "character" then
      val id = target.stripPrefix("character:")
      v.data.character.toRight(ApiError("resource_content_required","缺少角色")).flatMap { ch =>
        if id.isEmpty || id.length > 80 then Left(ApiError("invalid_target","角色标识无效"))
        else Right(in.copy(characters=if in.characters.exists(_.id == id) then in.characters.map(c => if c.id == id then ch.copy(id=id) else c) else in.characters :+ ch.copy(id=id)))
      }
    else if target == s"requirements:${r.id}" && Set("skill","asset","edit").contains(v.data.kind) then
      val marker = s"【资源 ${r.id}】"
      val end = s"【资源结束 ${r.id}】"
      val start = in.requirements.indexOf(marker)
      val finish = in.requirements.indexOf(end)
      val rest = if start >= 0 && finish >= start then in.requirements.take(start) + in.requirements.drop(finish+end.length) else in.requirements
      Right(in.copy(requirements=s"${rest.trim}\n$marker ${v.data.title}\n${v.data.description}\n${v.data.content}\n$end".trim))
    else if target == s"presentation:${r.id}" && v.data.kind == "promo" then Right(in)
    else if target.startsWith("slot:") && v.artwork.nonEmpty then Right(in)
    else Left(ApiError("incompatible_resource","该资源与接入位置不匹配；请选择对应角色、世界观、要求或美术位置"))
