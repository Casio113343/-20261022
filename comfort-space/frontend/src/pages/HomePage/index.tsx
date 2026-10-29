import {
  ArrowRight,
  ArrowUpRight,
  Feather,
  Leaf,
  LockKeyhole,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Composer, QuoteCard } from '../../components/ui';
import { cards } from '../../data/cards';
import { useApp } from '../../state/AppProvider';

export function HomePage() {
  const { state, send } = useApp();
  const navigate = useNavigate();
  const start = (text: string): boolean => {
    const id = send(text);
    if (id) navigate(`/chat/${id}`);
    return !!id;
  };
  return (
    <>
      <section className="mb-9 grid items-center gap-6 xl:grid-cols-[1.25fr_1fr]">
        <div className="relative z-10 py-4">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#e2e7d9] px-3 py-1.5 text-[10px] tracking-wider text-[#637053]">
            <Leaf size={12} />
            {state.preferences.nickname
              ? `${state.preferences.nickname}，给自己一点空间`
              : '欢迎，给自己一点空间'}
          </span>
          <h1 className="font-serif text-[34px] leading-[1.6] tracking-[.05em] text-[#3d4d38] sm:text-[43px]">
            有些话，
            <br />
            不必一个人收着<span className="text-[#63714c]">。</span>
          </h1>
          <p className="mt-4 max-w-sm text-[13px] leading-7 text-[#676f5e]">
            疲惫、委屈，或是一点说不清的心情。
            <br />
            不用急着找到答案，这里愿意先听你说。
          </p>
          <Link
            to="/chat"
            className="mt-6 inline-flex items-center gap-3 text-xs font-medium text-[#5f7251]"
          >
            慢慢说，我在听 <ArrowRight size={15} />
          </Link>
        </div>
        <div
          aria-hidden="true"
          className="relative hidden h-65 items-center justify-center overflow-hidden rounded-[44%_44%_36%_36%] bg-[radial-gradient(ellipse_at_50%_65%,#dce6cb_0%,#eef1e4_50%,transparent_72%)] sm:flex sm:h-74"
        >
          <div className="absolute bottom-10 h-19 w-63 rounded-[50%] bg-[#a7bb8d]/10 blur-xl" />
          <div className="absolute bottom-13 h-34 w-52 rounded-t-[50%] border-t border-white/70 bg-gradient-to-t from-[#c8d7b7]/20 to-white/30" />
          <div className="absolute top-9 size-18 rounded-full bg-[#fffdf2] shadow-[0_0_50px_#fffff0]" />
          <div className="relative mt-12 flex size-25 -rotate-35 items-center justify-center rounded-[70%_5%_70%_5%] bg-gradient-to-tr from-[#b2c496] to-[#e0e8c9] shadow-[15px_20px_35px_#a5b78b25]">
            <span className="absolute h-px w-22 -rotate-45 bg-[#f3f6e8]/70" />
          </div>
          <span className="absolute bottom-8 font-serif text-[12px] tracking-[.35em] text-[#637052]">
            让心慢一点
          </span>
          <Sparkles
            className="absolute right-13 top-23 text-[#62714c]"
            size={17}
            strokeWidth={1.1}
          />
          <span className="absolute left-14 top-38 size-1.5 rounded-full bg-[#b5c6a1]" />
        </div>
      </section>
      <section aria-labelledby="start-title" className="mb-10">
        <div className="mb-4 flex items-center justify-between">
          <h2
            id="start-title"
            className="flex items-center gap-2 text-sm font-medium text-[#607152]"
          >
            <MessageCircle size={16} strokeWidth={1.5} />
            现在，想说些什么？
          </h2>
          <span className="hidden text-[10px] text-[#676e5d] sm:block">
            不评判 · 不催促 · 按你的节奏
          </span>
        </div>
        <Composer
          large
          onSend={start}
          busy={
            !!state.pending ||
            !!state.failedSend ||
            state.saving ||
            !state.ready
          }
          placeholder="今天发生了什么？或者，只是想找个地方待一会儿……"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {['今天有点累', '有些话，想找人说说', '说不清，只想待一会儿'].map(
            (text) => (
              <button
                disabled={
                  !!state.pending ||
                  !!state.failedSend ||
                  state.saving ||
                  !state.ready
                }
                onClick={() => start(text)}
                key={text}
                className="rounded-full border border-[#e1e6d9] px-3 py-2 text-[10px] text-[#647056] transition hover:border-[#9cad8c] hover:bg-[#edf2e6] disabled:opacity-50"
              >
                {text} <span className="ml-2 text-[#666f58]">↗</span>
              </button>
            ),
          )}
        </div>
        <p className="mt-3 flex items-center gap-1.5 text-[10px] text-[#686f5d]">
          <LockKeyhole size={11} />
          演示回复不连接真实 AI · {'内容保存在本机后端，可刷新恢复。'}
        </p>
      </section>
      <section className="mb-9">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Feather size={16} strokeWidth={1.5} />
            <h2 className="text-sm font-medium">给此刻的你，一点温柔</h2>
          </div>
          <Link
            to="/library"
            className="flex items-center gap-1 text-[10px] text-[#657053]"
          >
            多拾几句 <ArrowUpRight size={13} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.slice(0, 3).map((card) => (
            <QuoteCard card={card} key={card.id} />
          ))}
        </div>
      </section>
      <Link
        to="/quiet"
        className="group flex items-center justify-between gap-4 rounded-2xl border border-[#e4e9dc] bg-[#f0f3e9]/70 px-6 py-5"
      >
        <div className="flex items-center gap-4">
          <span className="flex size-10 items-center justify-center rounded-full bg-white/70 text-[#61724c]">
            <Leaf size={18} strokeWidth={1.2} />
          </span>
          <div>
            <h2 className="font-serif text-sm text-[#607150]">
              不想说话的时候，也可以在这里
            </h2>
            <p className="mt-1.5 text-[10px] text-[#656f57]">
              跟着呼吸，让自己安静一小会儿。
            </p>
          </div>
        </div>
        <ArrowRight
          size={17}
          className="shrink-0 text-[#627150] transition group-hover:translate-x-1"
        />
      </Link>
    </>
  );
}
