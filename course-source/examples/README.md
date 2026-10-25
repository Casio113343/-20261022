# 两个案例源码归档

来源：课程云盘 `samples/sample.zip`。保留原作者在项目文档中的署名，归档供本项目学习参考，不宣称为本项目原创或另行授予许可证。

## 可下载源码

- [线上教学系统](./teaching-system-source.zip)：前后端源码、原有配置与报告。
- [LOCUS 房产平台](./locus-marketplace-source.zip)：前后端源码、原有配置、架构说明与 PDF 报告。
- [文件清单与校验值](./manifest.json)：每个归档的 SHA-256、字节数、文件数，以及内部文件路径和校验值。

两个源码包都去掉了原压缩包最外层的提交目录。LOCUS 包内保留原来的 `Ts_project/` 工程目录。

## 本地原始副本

`originals/teaching-system-original.zip` 与 `originals/locus-marketplace-original.zip` 按原目录保留每个案例的全部文件内容，仅本地保存，不进入 Git。

同步到 GitHub 的 `*-source.zip` 排除了编辑器目录、Git 数据、依赖目录、构建缓存及产物、日志和非模板环境配置；保留 `.env.example` 与源码、锁文件、构建定义及报告。源码内容未作改写，具体文件可通过 manifest 核对。

已对发布源码范围检查常见私钥和 GitHub / Google / OpenAI 密钥特征，未发现匹配；这不等同于完整安全审计。示例中的本地默认配置不应用作真实部署凭据。

保存过程只读取与归档，没有执行安装、构建、启动或外部 API 调用。两个源码包均已完成 ZIP 完整性检查。
