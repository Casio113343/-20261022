# 游戏生成平台后端

这是多类型游戏生成平台的新 Scala 3 后端，位于 `game-workshop/backend/`。

## 美术流水线更新

当前后端已加入独立美术清单、素材版本、局部修改、加工与失败重试。**GenerateGameMessage返回结构已变更**，前端必须读取status，不能把等待模型配置当作制作完成。完整接口与限制见 [后端美术任务与版本机制](../../docs/后端美术任务与版本机制.md)。真实图片模型仍未接入。

## 已实现

- 10种玩法介绍；MOBA、回合制RPG、塔防、卡牌声明为简化单机原型，其他类型仅可保存资料和整理方案。
- 访客会话、令牌哈希、按所有者隔离的作品与图片。
- 创作草稿、世界观、人物资料持久化，草稿允许暂缺参考玩法；整理方案时参考玩法必填。
- 本地确定性方案补充、人工修改、版本确认和原型配置生成。
- 乐观版本检查、同一创建请求标识幂等；修改原始资料后清除旧方案确认和原型。
- PNG/JPEG参考图上传及私有读取，格式签名、2MB和4096像素边长限制。

目前没有接入AI、图片理解、任意技能脚本、联网对战或任意代码生成。`GenerateGameMessage` 在所需美术就绪后生成绑定素材的模板运行配置；服务未配置时返回等待状态，需要配套前端运行器才能试玩。用户的自由文本要求作为设计资料保存，不声称已经转换成可执行机制。

## Windows 本机启动

需要 PowerShell 7 和网络；Node仅供后续前端使用。所有工具与数据库仅安装在项目本地，不提交到Git。

在仓库根目录执行：

```powershell
./game-workshop/scripts/setup-tools.ps1
./game-workshop/scripts/start-database.ps1
./game-workshop/backend/run.ps1 -Tasks @('test')
./game-workshop/backend/run.ps1 -Tasks @('runMain services.system.Main')
```

数据库监听 `127.0.0.1:55433`，HTTP监听 `127.0.0.1:8080`。随机数据库密码仅存在忽略的 `.runtime/db.json` 中；会话令牌由客户端保管，不应上传。`GET /health` 检查数据库连通性。

关闭后端使用终端 Ctrl+C；关闭项目数据库运行 `scripts/stop-database.ps1`。不要在数据库运行时删除其目录。

## 接口契约

所有业务接口使用 `POST /api/<消息名称去掉Message并转小写>`；输入输出为JSON。受保护接口必须携带 `Authorization: Bearer <token>`，不接收客户端自报所有者。对象不存在或不属于当前用户统一返回404。

| 消息 | 输入 | 返回 |
| --- | --- | --- |
| ListGenresMessage | `{}`，公开 | 玩法数组：介绍、操作、流程、胜负条件、提示、支持状态、范围 |
| StartSessionMessage | `{}`，公开 | `{ownerId, token}` |
| CreateProjectMessage | `{requestId, input}` | Project；同一所有者与requestId不重复创建 |
| ListProjectsMessage | `{}` | 本人的最近100个Project |
| GetProjectMessage | `{projectId}` | Project |
| SaveProjectMessage | `{projectId, expectedVersion, input}` | 更新后的Project |
| DeleteProjectMessage | `{projectId}` | `true` |
| PreparePlanMessage | `{projectId, expectedVersion}` | 带未确认方案的Project |
| RevisePlanMessage | `{projectId, expectedVersion, additions, settings}` | 更新后的Project，确认失效 |
| ConfirmPlanMessage | `{projectId, expectedVersion}` | 已确认的Project |
| GenerateGameMessage | `{projectId, expectedVersion}` | `{status, project, artwork, message}`；美术完成后project才含新GameArtifact |
| UploadAssetMessage | `{mime, base64}` | `{id,mime,base64}` |
| GetAssetMessage | JSON字符串assetId | `{id,mime,base64}` |

完整字段以 `src/main/scala/services/*/objects/` 为准；每个领域类型及消息独立文件。Project聚合包括 `id, ownerId, version, input, plan, artifact, updatedAt`；每次资料或方案修改返回新的version，后续请求必须使用该版本。生成配置不会修改输入版本；同版本重复生成返回已有配置。再次编辑原始资料后必须重新整理和确认。

`input` 包含 `title, genreId, reference, mechanics, requirements, world, characters`。所有字符串字段可为空但不能省略；world.images、characters及人物images为空时传 `[]`。世界观和人物字段见前端需求规格。每张人物卡须有非空且唯一的id；可使用UUID。图片引用格式为 `{assetId,purpose}`，后端检查其所有权。

`settings` 包含 `difficulty`（1—3）、`rounds`（3—10）。`additions` 是 `{title,content}` 数组。只有结构化设置会影响模板运行；改写说明文字不会创造新规则。

错误响应为 `{code,message,field}`，HTTP400为请求格式错误、401为会话无效、404为不存在或无权限、409为版本或幂等冲突、413为请求过大、422为业务校验失败。请求体上限3,000,000字节；正文每项6000字，标题120字；最多12名人物、世界观6图、人物各3图、总计24图。图片用途200字。

## 实现边界

数据库表由identity、projects、assets模块各自初始化和封装。Project的JSONB保存完整创作聚合，version列参与并发检查；没有全局内存业务存储。消息以 `plan(connection): IO[Response]` 编排，纯状态转换位于 `projects/utils/ProjectRules.scala`。连接按请求获取，提交或回滚后关闭；本地模板计算不涉及外部模型网络调用。

当前是本地开发服务，未部署公网。生产账号、过期会话清理、图片存储配额、模型调用任务调度与完整版本历史尚未实施。
