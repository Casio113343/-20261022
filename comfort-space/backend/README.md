# Scala 后端实施说明

当前阶段是用户确认的浏览器演示模式。本目录仅记录下一阶段后端计划，**没有可运行的 Scala 服务，没有数据库，也未进行前后端联调**。不能把前端 localStorage 描述为服务器持久化。

后续后端使用 Scala 3、Cats Effect IO、http4s、Circe 和 PostgreSQL，不能改用 Node.js 业务后端。当前设备尚未确认可用的 Java / sbt 工具链，实施时需先准备并验证环境。

按两个案例的共同思路组织模块化单体，按修订规章统一细节：

- `services/<domain>/api/XxxMessage.scala`：独立 `final case class`，实现 `plan(connection: Connection): IO[Response]`。
- `objects/`：各领域类型独立文件、不可变数据与 Circe 编解码；API 类型放 `objects/apiTypes/`。
- `routes/XxxRoutes.scala`：登记前端公开消息，统一推导名称；前端对应 `apis/<service>/`。
- `tables/<Table>/`：公开方法封装参数化 SQL、执行及行映射；初始化独立文件。
- `utils/`：仅本服务可见的纯业务辅助；共享配置、连接与应用入口归 `services/system/`。

对话发送链：路由校验身份 → 加载有归属的会话 → 纯规则处理新消息及策略 → IO 边界请求模型 → 在明确的事务和版本规则下保存 → 返回统一 Response。浏览器自报的 userId 不能直接成为可信身份。

真实 AI 尚未指定服务，因此本轮没有创建密钥配置、发出收费请求或假设某个供应商已经接入。
