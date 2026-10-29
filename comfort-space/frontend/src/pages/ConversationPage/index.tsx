import { useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Leaf, MessageCircle, Plus } from 'lucide-react';
import { Composer, EmptyState } from '../../components/ui';
import { useApp } from '../../state/AppProvider';

export function ConversationPage() {
  const { id } = useParams();
  const { state, send } = useApp();
  const navigate = useNavigate();
  const end = useRef<HTMLDivElement>(null);
  const conversation = state.conversations.find((c) => c.id === id);
  const waiting = state.pending?.conversationId === id;
  useEffect(() => {
    end.current?.scrollIntoView({
      behavior: state.preferences.reducedMotion ? 'instant' : 'smooth',
      block: 'end',
    });
  }, [conversation?.messages.length, waiting, state.preferences.reducedMotion]);
  const onSend = (text: string): boolean => {
    const nextId = send(text, id);
    if (nextId && nextId !== id) navigate(`/chat/${nextId}`, { replace: true });
    return !!nextId;
  };
  if (id && !conversation && state.ready)
    return (
      <EmptyState
        title="这段对话暂时不在这里"
        action={
          <Link to="/chat" className="text-sm underline">
            开始一段新的对话
          </Link>
        }
      >
        记录可能已被删除，或当前访客身份已经改变。你仍然可以从此刻重新说起。
      </EmptyState>
    );
  return (
    <div className="mx-auto flex min-h-[calc(100dvh-240px)] max-w-3xl flex-col">
      <header className="mb-6 flex items-center justify-between border-b border-[#e6ebde] pb-5">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            aria-label="回到首页"
            className="rounded-full p-2 text-[#637056] hover:bg-[#edf1e6]"
          >
            <ArrowLeft size={17} />
          </Link>
          <div>
            <h1 className="font-serif text-xl text-[#546849]">
              慢慢说，我在听
            </h1>
            <p className="mt-1 text-[10px] text-[#666f56]">
              无需归类你的感受，也不用急着找到答案
            </p>
          </div>
        </div>
        <Link
          to="/chat"
          className="flex items-center gap-1 rounded-full border border-[#dfe6d5] px-3 py-2 text-[10px] text-[#627152]"
        >
          <Plus size={12} />
          新的对话
        </Link>
      </header>
      <div className="mb-5 flex-1 space-y-7 pb-4">
        {!conversation && (
          <div className="py-9 text-center sm:py-16">
            <span className="mx-auto flex size-17 items-center justify-center rounded-[28px] bg-[#eaf0e1] text-[#5e7249]">
              <Leaf size={28} strokeWidth={1} />
            </span>
            <h2 className="mb-4 mt-7 font-serif text-2xl text-[#5e724f]">
              你可以从任何一句开始。
            </h2>
            <p className="text-sm leading-8 text-[#666f55]">
              不必说得有条理，也不必解释为什么。
              <br />
              先把最想说的那句话，放在这里。
            </p>
          </div>
        )}
        {conversation?.messages.map((message) => (
          <article
            key={message.id}
            className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
          >
            {message.role === 'assistant' && (
              <span className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-xl bg-[#e5ecdc] text-[#5d724d]">
                <Leaf size={16} strokeWidth={1.2} />
              </span>
            )}
            <div
              className={`max-w-[88%] ${message.role === 'user' ? 'rounded-[20px_20px_4px_20px] bg-[#e8eedf] px-5 py-4' : 'pt-1'}`}
            >
              <span className="mb-2 block text-[9px] tracking-wider text-[#657056]">
                {message.role === 'user' ? '你' : '栖语 · 演示回复'}
              </span>
              <p className="whitespace-pre-wrap break-words text-[14px] leading-[2] text-[#5b6b50]">
                {message.content}
              </p>
            </div>
          </article>
        ))}
        {waiting && (
          <div
            role="status"
            className="flex items-center gap-3 text-xs text-[#637151]"
          >
            <MessageCircle size={16} />
            <span className="animate-pulse">正在准备演示回复…</span>
          </div>
        )}
        <div ref={end} />
      </div>
      <div className="sticky bottom-0 bg-[#f8f9f4]/95 pt-3 pb-1 backdrop-blur">
        <Composer
          onSend={onSend}
          busy={
            !!state.pending ||
            !!state.failedSend ||
            state.saving ||
            !state.ready
          }
        />
        <p className="mt-3 text-center text-[10px] leading-5 text-[#676f5a]">
          演示模式使用预设回复，并非真实 AI。
          {'内容保存在本机后端，可刷新恢复。'}{' '}
          <Link className="underline underline-offset-2" to="/settings">
            设置
          </Link>
        </p>
      </div>
    </div>
  );
}
