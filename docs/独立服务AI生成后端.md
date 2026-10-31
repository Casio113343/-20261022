# 独立服务 AI 生成后端

六个独立生成消息：GenerateCharacterDesign、GenerateWorldDesign、GenerateSkillDesign、GenerateGameMaterial、GenerateImageEdit、GeneratePromotion。统一按消息名去除 Message 并转小写形成 POST /api 路由，需 Bearer 会话。

输入 GenerationInput：requestId（最多80字，单次创作稳定标识）、data（已有 ResourceData）、instruction（必填，最多6000字）、imageKind（scene/character/card/icon/tower）、generateImage（布尔）。素材与图片修改必须请求图片；图片修改必须传入 data.source 的原图项目与历史版本。角色和世界观按需选择是否同时生成图片。

首次请求持久化任务后释放数据库连接，再调用模型。相同 requestId 与输入返回同一任务；不同内容重用标识返回409。任务状态 pending / waiting_for_provider / running / succeeded / failed。运行租约120秒，模型处理整体超时100秒；过期执行的结果不能覆盖新尝试。请求中同步执行，无常驻后台任务或进程内任务缓存。

GetGeneration 接收任务ID字符串查询状态；RetryGeneration 接收ID字符串，显式重试失败或等待任务。重复生成请求不会自动重试失败任务。成功结果保存在 candidate，尚不写入资源库。

AcceptGeneration 接收 {taskId,resourceId,expectedVersion}，将候选保存为资源新版本；资源并发版本冲突返回409。同一任务重复确认不会重复创建版本，不能改存到其他资源。AI候选的原图和加工图、用途及内容哈希保留，之后可通过已有资源接入接口复用。生成与确认均校验会话归属。

## 模型连接

后端环境 GENERATION_GATEWAY_URL 指定模型网关完整 URL；可选 GENERATION_GATEWAY_TOKEN 作为 Authorization Bearer。HTTPS 或 localhost/127.0.0.1 HTTP；默认 Java 客户端不跟随重定向。没有配置时不调用模型、不伪造图片，返回 waiting_for_provider。

这是本项目定义的网关协议，不是任一模型厂商的直接接口。POST JSON 输入为 {request:GenerationInput,references:Asset[],original:Asset|null}，返回 {data:ResourceData,image:GeneratedImage|null}；GeneratedImage 为 {mime,base64,provider}。参考图和编辑原图由后端核实归属并提供。网关需落实图片编辑指令，不能用文字代替图像。图片PNG/JPEG经签名、大小、像素检查，再生成用途适配的PNG加工图。网关响应最多18MB。凭据不进入源码或前端。

尚未选定真实供应商，因此未实现或验证供应商专属SDK/API；需部署符合上述协议的网关或后续补充供应商适配。图片局部编辑质量仍需真实模型验收。

## 验证与边界

新增 PostgreSQL 集成测试覆盖：无模型等待、请求幂等、用户隔离、候选与保存分离、确认幂等、错误模型结果、失败后的显式重试。连同原27项回归共30项。没有连接真实付费模型，也未验证外部网关实机绘图。

本轮仅后端；前端生成按钮和候选审阅暂未接线。已有手工保存接口保留。原有游戏生成 ArtworkProvider 仍未配置，不会因新增独立服务网关自动启用。独立服务目前每次候选最多一张生成图，多图/动画及从资源库原图直接编辑需后续扩展。图片修改当前使用已有游戏美术历史作为原图来源。
