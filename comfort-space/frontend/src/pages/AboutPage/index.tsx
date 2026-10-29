import { Link } from 'react-router-dom';
import { Leaf, MessageCircle, HeartHandshake } from 'lucide-react';
import { PageHeading } from '../../components/ui';

export function AboutPage() {
  return (
    <>
      <PageHeading eyebrow="ABOUT QIYU" title="先听见你，再慢慢向前。">
        栖语，是一个以情绪陪伴为起点的课程项目。
      </PageHeading>
      <div className="rounded-3xl bg-[#edf1e6] p-7 sm:p-10">
        <Leaf size={28} strokeWidth={1.2} className="text-[#5d7252]" />
        <p className="mt-6 max-w-2xl font-serif text-2xl leading-loose">
          不需要先给心事贴一个标签。
          <br />
          你可以从任何一句话开始。
        </p>
        <p className="mt-5 max-w-2xl text-sm leading-8 text-[#637057]">
          设计希望先用几轮自然交流接住情绪，再在后台逐渐理解困扰的方向，让回应更贴近你，而不是把你带进一场分类问卷。
        </p>
      </div>
      <div className="my-7 grid gap-5 sm:grid-cols-2">
        {[
          {
            icon: MessageCircle,
            title: '当前是预设演示',
            text: '本版本已接通 Scala 后端和 PostgreSQL，不调用真实大模型。回复来自Scala 后端的确定性模板，用来体验交互，不具备开放式理解能力。关键词判断仅在至少三轮回复之后尝试；三轮是原型参数，不是对用户的要求。',
          },
          {
            icon: HeartHandshake,
            title: '随时停下来',
            text: '你可以继续说，也可以安静一下或直接离开。这里不提供诊断或专业心理咨询；遇到紧急危险，请联系身边可信任的人或当地紧急服务。',
          },
        ].map(({ icon: Icon, title, text }) => (
          <section
            key={title}
            className="rounded-2xl border border-[#e0e6d7] p-6"
          >
            <Icon size={20} className="text-[#5e7252]" />
            <h2 className="my-4 font-serif text-lg">{title}</h2>
            <p className="text-sm leading-7 text-[#656f5b]">{text}</p>
          </section>
        ))}
      </div>
      <Link
        to="/"
        className="inline-block rounded-full bg-[#657c61] px-6 py-3 text-sm text-white"
      >
        回到此刻
      </Link>
      <Link
        to="/privacy"
        className="ml-6 text-sm text-[#5f7152] underline underline-offset-4"
      >
        了解数据如何保存
      </Link>
    </>
  );
}
