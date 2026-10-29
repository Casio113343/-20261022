import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, History, Search, Trash2 } from 'lucide-react';
import { EmptyState, PageHeading } from '../../components/ui';
import { useApp } from '../../state/AppProvider';

export function HistoryPage() {
  const { state, setApp } = useApp();
  const [query, setQuery] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const filtered = state.conversations.filter((c) =>
    `${c.title} ${c.messages.map((m) => m.content).join(' ')}`.includes(query),
  );
  return (
    <>
      <PageHeading eyebrow="YOUR LITTLE STORIES" title="那些被听见的话">
        不用每一次都从头说起。愿意的时候，回来看看自己走过的片段。
      </PageHeading>
      <label className="mb-7 flex items-center gap-3 rounded-xl border border-[#e0e6d6] bg-white/70 px-4 py-3 text-[#647056]">
        <Search size={16} />
        <input
          className="w-full bg-transparent text-sm text-[#5f7250] outline-none"
          placeholder="找一段对话…"
          aria-label="搜索对话"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {!filtered.length ? (
        <EmptyState
          icon={<History size={23} strokeWidth={1.2} />}
          title={query ? '没有找到这段话' : '这里，等着你的第一段故事'}
          action={
            <Link
              to="/chat"
              className="text-xs text-[#5e724b] underline underline-offset-4"
            >
              去聊一会儿
            </Link>
          }
        >
          {query
            ? '试试别的词，或把搜索内容清空。'
            : '从一句话开始。你不需要一次说完，也不需要把它说得完整。'}
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {filtered.map((c) => (
            <article
              key={c.id}
              className="rounded-2xl border border-[#e5eadc] bg-white/65 px-5 py-5"
            >
              <div className="flex items-start justify-between gap-4">
                <Link to={`/chat/${c.id}`} className="min-w-0 flex-1">
                  <p className="mb-2 text-[10px] text-[#657057]">
                    {new Date(c.updatedAt).toLocaleDateString('zh-CN', {
                      month: 'long',
                      day: 'numeric',
                    })}{' '}
                    · {c.messages.filter((m) => m.role === 'user').length}{' '}
                    次表达
                  </p>
                  <h2 className="truncate font-serif text-lg text-[#5e724d]">
                    {c.title}
                  </h2>
                  <p className="mt-3 line-clamp-1 text-xs text-[#656f58]">
                    {c.messages.at(-1)?.content}
                  </p>
                </Link>
                <Link
                  to={`/chat/${c.id}`}
                  aria-label={`继续对话：${c.title}`}
                  className="p-2 text-[#62714f]"
                >
                  <ArrowUpRight size={18} />
                </Link>
                <button
                  onClick={() => setConfirmId(c.id)}
                  aria-label={`删除对话：${c.title}`}
                  className="rounded-lg p-2 text-[#686f5d] hover:bg-[#f5ebe5] hover:text-[#8e624e]"
                >
                  <Trash2 size={15} />
                </button>
              </div>
              {confirmId === c.id && (
                <div
                  role="alert"
                  className="mt-4 flex flex-wrap items-center gap-4 border-t border-[#e7ebdf] pt-4 text-xs text-[#7e6850]"
                >
                  <span>删除这段对话？此操作不可恢复。</span>
                  <button
                    className="underline"
                    onClick={() => {
                      setApp({ type: 'delete', id: c.id });
                      setConfirmId(null);
                    }}
                  >
                    确认删除
                  </button>
                  <button
                    className="text-[#627151]"
                    onClick={() => setConfirmId(null)}
                  >
                    保留
                  </button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
      <p className="mt-6 text-[11px] leading-6 text-[#656f57]">
        记录保存在本机服务器，并按当前访客身份隔离。清理 Cookie
        或身份过期后，将无法继续访问该身份的记录。
      </p>
    </>
  );
}
