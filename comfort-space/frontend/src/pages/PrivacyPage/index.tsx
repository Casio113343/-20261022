import { Link } from 'react-router-dom';
import { PageHeading } from '../../components/ui';

const sections = [
  [
    '内容留在哪里？',
    '当前是后端演示模式。对话、收藏、手记和偏好会发送到本机 Scala 服务，并保存在本机 PostgreSQL 数据库。服务仅监听 127.0.0.1，没有调用外部模型；当前不提供公网部署或跨设备同步。',
  ],
  [
    '访客身份与保留时间',
    '浏览器通过 HttpOnly、SameSite=Strict Cookie 识别访客，前端脚本不能读取该凭据。默认使用会话 Cookie；开启保持访客身份后，Cookie 最长保存 7 天。服务器身份固定在创建后 7 天到期，过期数据会在启动及每小时清理。服务未运行时无法执行清理。关闭保持身份不删除数据库内容。',
  ],
  [
    '怎样删除或带走？',
    '可以单独删除对话和手记、取消收藏，或在“我的偏好”导出 JSON、清空全部内容。清空操作在数据库事务中完成。导出的文件、你自行创建的数据库备份需要另行保管或删除。清理 Cookie 会失去当前访客记录的访问身份；本版本没有身份找回。',
  ],
  [
    '演示边界与本机访问',
    '回复和方向判断都是服务端模板与关键词规则，不具备真实模型理解能力，也不是专业建议。本机数据库未做内容字段加密，具有本机文件或数据库管理权限的人可能读取它。旧版 localStorage 不会自动上传或迁移。本版本尚未提供账号登录、真实 AI、流式回复或公网安全配置。',
  ],
] as const;
export function PrivacyPage() {
  return (
    <>
      <PageHeading
        eyebrow="YOUR WORDS, YOUR CHOICE"
        title="你的心事，由你保管。"
      >
        当前版本：本机后端演示 · 无外部模型调用
      </PageHeading>
      <div className="space-y-5">
        {sections.map(([title, text], index) => (
          <section
            key={title}
            className="rounded-2xl border border-[#e0e6d7] bg-white/50 p-6 sm:p-8"
          >
            <p className="mb-3 text-[10px] tracking-widest text-[#657056]">
              0{index + 1}
            </p>
            <h2 className="mb-3 font-serif text-xl">{title}</h2>
            <p className="max-w-3xl text-sm leading-8 text-[#646f5a]">{text}</p>
          </section>
        ))}
      </div>
      <Link
        to="/settings"
        className="mt-7 inline-block rounded-full bg-[#657c61] px-6 py-3 text-sm text-white"
      >
        管理我的内容
      </Link>
    </>
  );
}
