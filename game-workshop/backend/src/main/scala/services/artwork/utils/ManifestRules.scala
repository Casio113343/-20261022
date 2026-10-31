package services.artwork.utils
import services.artwork.objects.*
import services.projects.objects.Project
import services.system.api.ApiError
private[artwork] object ManifestRules:
  private def changed(old: ArtworkManifest, next: ArtworkManifest): ArtworkManifest =
    if old == next then old else next.copy(revision=old.revision+1)
  private def active(task: ArtworkTask): Boolean = Set(TaskStatus.Pending,TaskStatus.Running,TaskStatus.Blocked,TaskStatus.Failed).contains(task.status)
  private def error(code: String, detail: String): ApiError = ApiError(code,detail,status=409)
  def synchronize(p: Project, version: Int, old: ArtworkManifest): Either[ApiError,ArtworkManifest] = ArtworkRules.build(p,version).map { requirements =>
    val ids = requirements.briefs.map(_.slotId).toSet
    val slots = requirements.briefs.map(b => old.slots.find(_.id == b.slotId).fold(ArtworkSlot(b.slotId,b.kind,b.subject,b,None,true))(s => s.copy(subject=b.subject,brief=b,active=true))) ++ old.slots.filterNot(s => ids.contains(s.id)).map(_.copy(active=false))
    val keptTasks = old.tasks.map(t => if !ids.contains(t.slotId) && active(t) then t.copy(status=TaskStatus.Obsolete,leaseToken=None,leaseUntil=0L,error=Some("该对象已移除")) else t)
    val created = slots.filter(s => s.active && s.currentRevisionId.isEmpty && !keptTasks.exists(t => t.slotId == s.id && active(t))).map { s =>
      ArtworkTask(s"${old.revision+1}:${s.id}",s.id,"generate","首次制作所需美术",s.brief,None,s"initial:${old.revision+1}",TaskStatus.Pending,0,None,0L,None)
    }
    changed(old,old.copy(slots=slots,tasks=keptTasks ++ created))
  }
  def edit(old: ArtworkManifest, expected: Int, requestId: String, ids: List[String], instruction: String): Either[ApiError,ArtworkManifest] =
    val previous = old.tasks.filter(_.requestId == requestId)
    if requestId.trim.isEmpty || requestId.length > 80 || instruction.trim.isEmpty || instruction.length > 6000 || ids.isEmpty || ids.distinct.size != ids.size then Left(ApiError("invalid_artwork_edit","必须明确列出要修改的素材与视觉要求；请求标识最多80字，说明最多6000字"))
    else if previous.nonEmpty then
      if previous.map(_.slotId).toSet == ids.toSet && previous.forall(_.instruction == instruction) then Right(old)
      else Left(error("request_conflict","同一请求标识已用于不同美术修改"))
    else if expected != old.revision then Left(error("artwork_conflict","美术版本已更新"))
    else if ids.exists(id => !old.slots.exists(s => s.id == id && s.active && s.currentRevisionId.nonEmpty)) then Left(ApiError("artwork_missing","指定素材尚无可编辑原图或已停用"))
    else if ids.exists(id => old.tasks.exists(t => t.slotId == id && active(t))) then Left(error("artwork_busy","指定素材已有未完成任务，请先完成或重试"))
    else
      val tasks = ids.flatMap(id => old.slots.find(_.id == id)).map { s => ArtworkTask(s"${old.revision+1}:${s.id}",s.id,"edit",instruction,s.brief,s.currentRevisionId,requestId,TaskStatus.Pending,0,None,0L,None) }
      Right(changed(old,old.copy(tasks=old.tasks ++ tasks)))
  def claim(old: ArtworkManifest, taskId: String, token: String, now: Long, configured: Boolean): Either[ApiError,ArtworkManifest] =
    old.tasks.find(_.id == taskId).toRight(ApiError("not_found","美术任务不存在",status=404)).flatMap { task =>
      if Set(TaskStatus.Succeeded,TaskStatus.Obsolete).contains(task.status) then Right(old)
      else if task.status == TaskStatus.Running && task.leaseUntil > now then Left(error("task_running","该任务正在执行"))
      else if task.status == TaskStatus.Failed then Left(error("retry_required","请明确重试失败任务"))
      else
        val next = if configured then task.copy(status=TaskStatus.Running,attempts=task.attempts+1,leaseToken=Some(token),leaseUntil=now+120000L,error=None)
                   else task.copy(status=TaskStatus.Blocked,leaseToken=None,leaseUntil=0L,error=Some("图片生成服务尚未配置，未生成美术"))
        Right(changed(old,old.copy(tasks=old.tasks.map(t => if t.id == taskId then next else t))))
    }
  def retry(old: ArtworkManifest, taskId: String, now: Long): Either[ApiError,ArtworkManifest] =
    old.tasks.find(_.id == taskId).toRight(ApiError("not_found","美术任务不存在",status=404)).flatMap { task =>
      if task.status == TaskStatus.Succeeded || task.status == TaskStatus.Pending then Right(old)
      else if task.status == TaskStatus.Obsolete then Left(error("obsolete_task","已过期任务不能重试"))
      else if task.status == TaskStatus.Running && task.leaseUntil > now then Left(error("task_running","任务仍在执行"))
      else Right(changed(old,old.copy(tasks=old.tasks.map(t => if t.id == taskId then t.copy(status=TaskStatus.Pending,leaseToken=None,leaseUntil=0L,error=None) else t))))
    }
  def accepts(old: ArtworkManifest, taskId: String, token: String): Boolean =
    old.tasks.find(_.id == taskId).exists(t => t.status == TaskStatus.Running && t.leaseToken.contains(token) && old.slots.exists(s => s.id == t.slotId && s.active && s.currentRevisionId == t.baseRevisionId))
  def succeed(old: ArtworkManifest, taskId: String, token: String, result: ArtworkRevision): Either[ApiError,ArtworkManifest] =
    if !accepts(old,taskId,token) then Left(error("stale_artwork_result","任务已变化，不能覆盖已有美术"))
    else old.tasks.find(_.id == taskId).toRight(error("stale_artwork_result","任务不存在")).flatMap { task =>
      if result.slotId != task.slotId || result.parentRevisionId != task.baseRevisionId || result.originalHash.isEmpty || result.processedHash.isEmpty then Left(ApiError("invalid_artwork_result","生成结果与任务不匹配"))
      else Right(changed(old,old.copy(slots=old.slots.map(s => if s.id == task.slotId then s.copy(currentRevisionId=Some(result.id)) else s),tasks=old.tasks.map(t => if t.id == taskId then t.copy(status=TaskStatus.Succeeded,leaseToken=None,leaseUntil=0L,error=None) else t),history=old.history :+ result)))
    }
  def fail(old: ArtworkManifest, taskId: String, token: String, message: String): ArtworkManifest =
    changed(old,old.copy(tasks=old.tasks.map(t => if t.id == taskId && t.status == TaskStatus.Running && t.leaseToken.contains(token) then t.copy(status=TaskStatus.Failed,leaseToken=None,leaseUntil=0L,error=Some(message.take(200))) else t)))
  def restore(old: ArtworkManifest, expected: Int, revisionId: String): Either[ApiError,ArtworkManifest] =
    if expected != old.revision then Left(error("artwork_conflict","美术版本已更新"))
    else old.history.find(_.id == revisionId).toRight(ApiError("not_found","素材历史版本不存在",status=404)).flatMap { revision =>
      if !old.slots.exists(s => s.id == revision.slotId && s.active) then Left(ApiError("inactive_slot","当前玩法未使用该素材"))
      else Right(changed(old,old.copy(slots=old.slots.map(s => if s.id == revision.slotId then s.copy(currentRevisionId=Some(revision.id)) else s),tasks=old.tasks.map(t => if t.slotId == revision.slotId && active(t) then t.copy(status=TaskStatus.Obsolete,leaseToken=None,leaseUntil=0L,error=Some("用户恢复了素材版本")) else t))))
    }
  def bindings(state: ArtworkManifest): List[ArtworkBinding] = state.slots.filter(_.active).flatMap(s => s.currentRevisionId.flatMap(id => state.history.find(_.id == id)).map(r => ArtworkBinding(s.id,r.id,r.originalAssetId,r.processedAssetId,r.originalHash,r.processedHash)))
  def ready(state: ArtworkManifest): Boolean =
    state.slots.exists(_.active) && state.slots.filter(_.active).forall(s => s.currentRevisionId.exists(id => state.history.exists(_.id == id)) && !state.tasks.exists(t => t.slotId == s.id && active(t)))
