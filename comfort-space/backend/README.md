# 栖语 Scala 后端

当前已实现本机可运行的 Scala 3 + Cats Effect IO + http4s + Circe + PostgreSQL 后端，并接通现有 React 页面。回复仍是明确标注的服务端演示模板，不调用真实模型。

## 已完成

- 访客会话：服务端生成凭据，Cookie 为 HttpOnly、SameSite=Strict；数据库只保存令牌散列。
- 对话：创建、列表、详情、发送、删除；校验归属，客户端不能自报可信 userId。
- 幂等发送：同一访客的相同 requestId 不重复写入；正文或会话不同则返回 409。
- 陪伴：前几轮先接住情绪，达到可配置门槛且线索足够后再调整后续方向，不出现分类问卷。
- 收藏、心情手记、偏好：实际保存到 PostgreSQL；导出由前端下载本人已同步的数据。
- 清空：单个事务删除本人对话、关联请求、手记、收藏并重置偏好。
- 错误与取消：明确状态码、回滚、请求体上限；前端失败时不冒充保存成功或自动切回本地模板。

## 本机启动（Windows PowerShell 7）

在仓库的 `comfort-space` 目录执行，首次准备需要网络：

```powershell
./scripts/setup-tools.ps1
./scripts/start-database.ps1
./backend/run.ps1
```

另开终端启动前端：

```powershell
cd comfort-space/frontend
npm ci
npm run dev
```

- 页面：`http://127.0.0.1:5173/`
- 后端：`http://127.0.0.1:8080/api/health`
- 项目专用 PostgreSQL：`127.0.0.1:55432`，数据库 `qiyu`。

准备脚本下载 Adoptium JDK 21、锁定的 sbt 和 Maven Central 中的 PostgreSQL 16.4.0 便携包，检查下载校验值；运行文件位于 `.tools/`，不纳入 Git。首次创建随机数据库密码，保存在忽略的 `.runtime/dev-db.json`。请保管此文件，不要提交或在聊天中发送。它不是生产环境密钥管理方案。

PostgreSQL 原生工具在中文路径下出现过编码问题；启动脚本会建立项目专属的临时英文路径映射，实际数据库和工具仍位于 `comfort-space`，不会复制或迁移原项目。已有数据库存在而凭据文件缺失时，脚本会报错，不自动覆盖密码。

端口被占用时不要结束其他项目的进程。后端可用 `QIYU_PORT` 修改端口，同时调整 Vite 的代理目标；数据库也可以改用自行管理的 PostgreSQL。

## 使用已有 PostgreSQL

按 `.env.example` 设置环境变量（脚本不自动加载 .env 文件），再执行 `backend/run.ps1` 或在 backend 中使用 sbt：

```powershell
$env:QIYU_DB_URL = 'jdbc:postgresql://127.0.0.1:5432/qiyu'
$env:QIYU_DB_USER = 'your_user'
$env:QIYU_DB_PASSWORD = '<在本机填写，不提交>'
./backend/run.ps1
```

现有数据库应预先创建。启动会按各 TableInitializer 创建本项目表；不要指向包含同名业务表的其他项目数据库。正式部署需另行管理迁移、权限和备份，不能直接沿用开发数据库的超级用户。

## 检查

先启动项目数据库，再运行：

```powershell
./backend/run.ps1 -Tasks test
./backend/run.ps1 -Tasks scalafmtCheckAll,scalafmtSbtCheck
```

同一工程的 sbt `run` 与测试不要并行执行；Windows 会发生构建锁冲突，先在后端终端按 Ctrl+C，再测试。数据库集成测试使用合成内容和独立访客，结束后清理它们，不读取或清空你的访客数据。

测试覆盖纯陪伴规则、枚举、并发幂等、越权阻止、事务失败及取消回滚、数据恢复与清空、API 名称一致性、跨站请求、请求体上限。详细结果见 [后端验收记录](../docs/后端验收记录.md)。

## 停止

前端和后端在各自终端按 Ctrl+C。数据库在 Windows 临时英文路径映射下保持独立进程；在 `comfort-space` 执行以下命令正常关闭，不删除数据：

```powershell
./scripts/stop-database.ps1
```

## 范围

这是课程项目的本机后端演示版，包含真实 API 和数据库，不是生产公网服务。当前没有正式账号注册、身份找回、真实模型、流式输出、跨设备同步和公网 HTTPS 部署。访客身份创建后固定 7 天过期，过期数据在后端启动及每小时清理，服务停止期间不执行清理。无单独内容字段加密。

演示模板计算很快，因此本轮输入、回复、方向和幂等记录在一个短数据库事务内原子提交。**未来接入外部模型时必须改成预约输入、释放连接调用模型、版本校验提交回复的阶段流程，不能把外部网络请求直接放进现有事务。**

接口与结构见 [后端接口与数据约定](../docs/后端接口与数据约定.md)。
