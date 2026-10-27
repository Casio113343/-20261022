import { Link } from 'react-router-dom';
import { PageHeading } from '../../components/ui';

const sections = [
  [
    '内容留在哪里？',
    '当前演示模式没有账号、没有模型请求，也不向后端上传你的对话或手记。内容默认只存在当前页面内存中，刷新或关闭后消失。',
  ],
  [
    '开启本地保存后',
    '只有当你在“我的偏好”中开启“在这台设备记住内容”，才会将对话、收藏、手记与偏好存入当前浏览器 localStorage。它没有单独加密，同一设备同一浏览器的其他使用者可能查看，请避免在共享设备保存敏感信息。',
  ],
  [
    '怎样删除或带走？',
    '你可以单独删除对话或手记、取消收藏，也可以在“我的偏好”导出 JSON 或清空全部内容。关闭本地保存会删除浏览器中的副本，但本次已打开页面仍保留内容直至刷新。自行导出的文件需要由你另行删除。',
  ],
  [
    '演示范围',
    '预设回复与关键词方向判断都在本地执行，不是专业建议。刷新时未完成的演示回复不会恢复，你可以继续发送新消息。未来若接入真实 AI 或服务器保存，应先更新本说明并提供明确选择。',
  ],
] as const;
export function PrivacyPage() {
  return (
    <>
      <PageHeading
        eyebrow="YOUR WORDS, YOUR CHOICE"
        title="你的心事，由你保管。"
      >
        当前版本：本地演示 · 无外部模型调用
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
