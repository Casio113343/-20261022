package services.artwork.utils
import services.projects.objects.{Project,GameInput}
import services.artwork.objects.{ArtworkBrief,ArtworkRequirements}
import services.system.api.ApiError
private[artwork] object ArtworkRules:
  def required(in: GameInput, version: Int = 0): List[ArtworkBrief] =
    val shared = s"原创游戏美术。游戏类型：${in.genreId}。世界背景：${in.world.background}。阵营冲突：${in.world.conflict}。视觉要求：${in.world.visual}。必须保留：${in.world.preserve}。不要文字、水印或界面按钮。"
    val scene = ArtworkBrief("scene","scene","游戏场景",s"$shared 生成可实际用于游戏的场景背景，保留清楚的可操作区域。",in.world.images.map(_.assetId),"3:2",version)
    val characters = if in.characters.isEmpty then List(ArtworkBrief("character-default","character","默认角色",s"$shared 生成适配世界观的完整角色，透明背景、清晰轮廓。",Nil,"1:1",version)) else in.characters.map { c =>
      ArtworkBrief(s"character-${c.id}","character",c.name,s"$shared 角色：${c.name}；身份：${c.identity}；阵营：${c.faction}；背景：${c.background}；性格：${c.personality}；能力：${c.skills}；必须保留：${c.preserve}；允许补充：${c.freedom}。完整角色，透明背景、清晰轮廓。",c.images.map(_.assetId),"1:1",version)
    }
    val cards = if in.genreId == "cards" then List("攻击","防御","治疗").zipWithIndex.map { case (kind,index) => ArtworkBrief(s"card-$index","card",s"${kind}卡面",s"$shared 生成${kind}主题卡牌插画，保持统一画风，不包含数值或文字。",in.world.images.map(_.assetId),"2:3",version) } else Nil
    val structures = if Set("moba","tower-defense").contains(in.genreId) then List(ArtworkBrief("tower-default","structure","防御塔",s"$shared 防御塔游戏素材，透明背景。",Nil,"1:1",version)) else Nil
    val enemy = if in.characters.size < 2 then List(ArtworkBrief("enemy-default","character","默认敌人",s"$shared 生成敌方单位素材，透明背景，视觉上可与玩家区分。",Nil,"1:1",version)) else Nil
    scene :: characters ++ cards ++ structures ++ enemy
  def build(p: Project, version: Int): Either[ApiError,ArtworkRequirements] =
    if p.version != version then Left(ApiError("version_conflict","资料已更新，请重新整理美术需求",status=409))
    else p.plan.filter(plan => plan.confirmed && plan.inputVersion == p.version).toRight(ApiError("confirmation_required","请先确认当前游戏方案",status=409)).map { _ =>
      ArtworkRequirements(p.id,p.version,false,"provider_not_configured",required(p.input,p.version),List("当前未配置图片模型；清单不是生成结果。","修改资料默认复用已有素材，只有明确的视觉修改才局部重画。","所需素材生成、加工并绑定后，才能生成有美术的原型配置。"))
    }
