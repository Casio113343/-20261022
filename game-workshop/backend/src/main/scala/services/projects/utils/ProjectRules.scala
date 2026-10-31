package services.projects.utils
import services.projects.objects.*
import services.catalog.objects.GenreCatalog
import services.system.api.ApiError
import services.artwork.objects.ArtworkBinding
private[projects] object ProjectRules:
  def expect(p: Project, version: Int): Either[ApiError, Unit] = Either.cond(p.version == version, (), ApiError("version_conflict","资料已变化，请重新加载后操作",status=409))
  def validate(in: GameInput, requireReference: Boolean): Either[ApiError, Unit] =
    val texts = List(in.title,in.reference,in.mechanics,in.requirements,in.world.background,in.world.conflict,in.world.rules,in.world.visual,in.world.preserve,in.world.freedom) ++ in.characters.flatMap(c => List(c.id,c.name,c.identity,c.faction,c.background,c.personality,c.catchphrase,c.relationships,c.skills,c.role,c.preserve,c.freedom))
    val refs = in.world.images ++ in.characters.flatMap(_.images)
    if !GenreCatalog.all.exists(_.id == in.genreId) then Left(ApiError("invalid_genre","请选择有效游戏类型","genreId"))
    else if requireReference && in.reference.trim.isEmpty then Left(ApiError("reference_required","请填写参考游戏或具体模式","reference"))
    else if texts.exists(_.length > 6000) || in.title.length > 120 then Left(ApiError("text_limit","标题最多120字，其余每项最多6000字"))
    else if in.characters.size > 12 then Left(ApiError("character_limit","最多添加12名人物","characters"))
    else if in.characters.map(_.id).distinct.size != in.characters.size || in.characters.exists(c => c.id.trim.isEmpty || c.id.length > 80) then Left(ApiError("character_id","人物标识不能为空、重复或超过80字","characters"))
    else if in.world.images.size > 6 || in.characters.exists(_.images.size > 3) || refs.size > 24 || refs.exists(r => r.assetId.length > 80 || r.purpose.length > 200) then Left(ApiError("image_limit","世界观最多6张图、每名人物最多3张、总计最多24张；用途最多200字"))
    else Right(())
  def save(p: Project, version: Int, in: GameInput, now: String): Either[ApiError, Project] = expect(p,version).flatMap(_ => validate(in,false)).map(_ => p.copy(version=p.version+1,input=in,plan=None,artifact=None,updatedAt=now))
  def prepare(p: Project, version: Int, now: String): Either[ApiError, Project] = expect(p,version).flatMap(_ => validate(p.input,true)).map { _ =>
    val genre = GenreCatalog.all.find(_.id == p.input.genreId).toList
    val additions = genre.flatMap(g => List(PlanSection("参考机制说明",if p.input.mechanics.trim.nonEmpty then p.input.mechanics else s"建议采用：${g.mechanics.mkString("、")}；未自动解析参考游戏，请核对。"),PlanSection("核心流程",g.loop),PlanSection("胜负条件",g.victory),PlanSection("运行范围",g.scope)))
    val unresolved = List("本地规则模板没有理解图片或自由文本技能；图片仅保存参考。","人物技能、特殊世界规则及自定义要求仅进入设计资料，运行时仍使用公开的简化模板规则。","请核对参考模式；当前没有 AI 推断、联网对战和任意代码生成。")
    p.copy(version=p.version+1,plan=Some(DesignPlan(p.version+1,p.input,additions,unresolved,RuntimeSettings(2,5),false,"local-template-v1")),artifact=None,updatedAt=now)
  }
  def revise(p: Project, version: Int, additions: List[PlanSection], settings: RuntimeSettings, now: String): Either[ApiError, Project] = expect(p,version).flatMap { _ =>
    p.plan.toRight(ApiError("plan_missing","请先整理方案")).flatMap { plan =>
      if additions.size > 20 || additions.exists(s => s.title.length > 120 || s.content.length > 6000) || settings.difficulty < 1 || settings.difficulty > 3 || settings.rounds < 3 || settings.rounds > 10 then Left(ApiError("plan_invalid","难度为1—3，目标为3—10，补充方案最多20项且单项最多6000字"))
      else Right(p.copy(version=p.version+1,plan=Some(plan.copy(inputVersion=p.version+1,additions=additions,settings=settings,confirmed=false)),artifact=None,updatedAt=now))
    }
  }
  def confirm(p: Project, version: Int, now: String): Either[ApiError, Project] = expect(p,version).flatMap(_ => p.plan.toRight(ApiError("plan_missing","请先整理方案"))).flatMap { plan =>
    if plan.inputVersion != p.version then Left(ApiError("stale_plan","方案已过期",status=409))
    else if plan.confirmed then Right(p)
    else Right(p.copy(version=p.version+1,plan=Some(plan.copy(inputVersion=p.version+1,confirmed=true)),updatedAt=now))
  }
  def generate(p: Project, version: Int, now: String, artifactId: String, bindings: List[ArtworkBinding] = Nil): Either[ApiError, Project] = expect(p,version).flatMap(_ => p.plan.toRight(ApiError("plan_missing","请先整理并确认方案"))).flatMap { plan =>
    if !plan.confirmed || plan.inputVersion != p.version then Left(ApiError("confirmation_required","请确认当前版本方案后再生成",status=409))
    else if !GenreCatalog.all.exists(g => g.id == p.input.genreId && g.support == "prototype") then Left(ApiError("unsupported","该类型暂不支持试玩",status=422))
    else if bindings.isEmpty || bindings.map(_.slotId).distinct.size != bindings.size then Left(ApiError("artwork_required","所需美术尚未完成，不能交付游戏",status=409))
    else if p.artifact.exists(_.artworkBindings == bindings) then Right(p)
    else Right(p.copy(artifact=Some(GameArtifact(artifactId,p.id,p.version,p.input.genreId,p.input.title,p.input.characters,p.input.world,plan.settings,plan.engine,bindings)),updatedAt=now))
  }
