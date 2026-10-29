# 栖语 · 安慰网站

新网站的前端、后端、配置、启动脚本和说明均位于本文件夹；课程资料与历史交接文档继续保留在仓库原位置。

## 当前版本

已接通 **TypeScript + React + Zustand + Tailwind 前端** 与 **Scala 3 + Cats Effect IO + http4s + Circe + PostgreSQL 后端**。对话、收藏、手记和偏好实际保存到本机数据库，刷新后可恢复。

**回复仍为服务端确定性演示模板，不是真实 AI。** 当前没有收费模型调用、账号登录或公网部署。

## 页面

| 页面 | 路径 | 功能 |
| --- | --- | --- |
| 此刻，停靠 | `/` | 直接输入心事、快捷开场 |
| 聊一会儿 | `/chat`、`/chat/:id` | 连续消息、服务端回复、失败重试 |
| 往日对话 | `/history` | 搜索、继续、删除本人对话 |
| 拾一句温柔 | `/library` | 标签筛选、收藏与取消 |
| 收藏的微光 | `/saved` | 查看已保存卡片 |
| 安静片刻 | `/quiet` | 一分钟呼吸提示、暂停与重置 |
| 心情手记 | `/mood` | 添加、查看与删除 |
| 我的偏好 | `/settings` | 称呼、保持访客身份、减少动态、导出与清空 |
| 关于栖语 | `/about` | 产品与演示范围 |
| 隐私与数据 | `/privacy` | 实际保存位置、期限和删除方式 |

先安慰、再引导：入口不要求分类。服务端达到可配置的试验门槛且信息足够后，才后台调整方向；默认三轮是演示参数，不是对用户的固定要求。

## 启动

首次准备与日常启动见 [后端 README](backend/README.md)。Windows PowerShell 7 下：

```powershell
# 从仓库根目录进入网站文件夹
cd comfort-space
./scripts/setup-tools.ps1
./scripts/start-database.ps1
./backend/run.ps1
```

另开终端：

```powershell
cd comfort-space/frontend
npm ci
npm run dev
```

打开 `http://127.0.0.1:5173/`。需要本机数据库、后端和前端服务运行；它不是公网地址。

前端检查：`npm test`、`npm run build`。后端检查：`./backend/run.ps1 -Tasks test`（先停止同工程的 sbt run）。

## 数据与边界

使用受控访客 Cookie 隔离数据，数据库保存内容；默认 Cookie 在浏览器会话中使用，开启保持身份后最长保存 7 天。身份固定创建后七天失效；丢失 Cookie 后无法找回访客记录。可导出本人已同步内容或清空本人数据。详情见网站隐私页。

旧浏览器演示版的 localStorage 不会自动上传。`.tools/`、`.runtime/`、密钥、数据库文件、下载的个人记录和依赖缓存不提交到 Git，也不纳入作业附件。

- [架构与实现边界](docs/架构与实现边界.md)
- [后端接口与数据约定](docs/后端接口与数据约定.md)
- [后端验收记录](docs/后端验收记录.md)
- [首版演示及录屏准备](docs/验收与演示流程.md)（2026-10-27 记录为历史版本）

编写或修改代码前，必须遵守仓库根目录的 [编码规章](../本项目编码规章制度.md) 和 [AGENTS.md](../AGENTS.md)。
