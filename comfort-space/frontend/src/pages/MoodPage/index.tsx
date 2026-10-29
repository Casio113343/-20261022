import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { EmptyState, PageHeading } from '../../components/ui';
import { useApp } from '../../state/AppProvider';

const feelings = [
  '还不错',
  '有点累',
  '低落',
  '焦虑',
  '平静',
  '说不清',
] as const;
export function MoodPage() {
  const { state, setApp } = useApp();
  const [feeling, setFeeling] = useState<string>('说不清');
  const [note, setNote] = useState('');
  const [notice, setNotice] = useState('');
  return (
    <>
      <PageHeading
        eyebrow="A NOTE TO YOURSELF"
        title="今天的心情，也值得被看见。"
      >
        不必分析对错，给此刻留下一小行就好。
      </PageHeading>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setApp({
            type: 'mood',
            mood: {
              id: crypto.randomUUID(),
              feeling,
              note: note.trim(),
              createdAt: new Date().toISOString(),
            },
          });
          setNote('');
          setNotice('已提交，请留意页面同步结果。');
        }}
        className="mb-9 rounded-3xl border border-[#e1e6d9] bg-white/70 p-6 sm:p-8"
      >
        <fieldset>
          <legend className="mb-4 text-sm">此刻更接近哪一种感觉？</legend>
          <div className="flex flex-wrap gap-3">
            {feelings.map((item) => (
              <label
                key={item}
                className={`cursor-pointer rounded-full border px-4 py-2 text-sm ${item === feeling ? 'border-[#7c9270] bg-[#eaf0e3]' : 'border-[#e4e8dc]'}`}
              >
                <input
                  type="radio"
                  name="feeling"
                  value={item}
                  checked={item === feeling}
                  onChange={() => setFeeling(item)}
                  className="sr-only"
                />
                {item}
              </label>
            ))}
          </div>
        </fieldset>
        <label htmlFor="mood-note" className="mb-3 mt-7 block text-sm">
          想记下一点什么？
          <span className="ml-2 text-xs text-[#676f5e]">可留空</span>
        </label>
        <textarea
          id="mood-note"
          value={note}
          maxLength={1000}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="今天有一个很小的瞬间……"
          className="w-full resize-none rounded-2xl border border-[#e0e5d7] bg-[#fafbf6] p-4 text-sm leading-7 outline-none focus:border-[#809572]"
        />
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <p role="status" className="text-xs text-[#617156]">
            {notice || '只为你自己记录，不做情绪评分。'}
          </p>
          <button className="rounded-full bg-[#657c61] px-6 py-3 text-sm text-white hover:bg-[#52694f]">
            记下此刻
          </button>
        </div>
      </form>
      {state.moods.length === 0 ? (
        <EmptyState title="留一页空白，也很好。">
          你的第一篇心情手记，会安静地放在这里。
        </EmptyState>
      ) : (
        <div className="space-y-4">
          {state.moods.map((mood) => (
            <article
              key={mood.id}
              className="rounded-2xl border border-[#e4e8dc] bg-white/60 p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-[#edf1e6] px-3 py-1 text-xs">
                  {mood.feeling}
                </span>
                <div className="flex items-center gap-4">
                  <time className="text-xs text-[#676f5c]">
                    {new Date(mood.createdAt).toLocaleString('zh-CN')}
                  </time>
                  <button
                    aria-label="删除这篇手记"
                    onClick={() => setApp({ type: 'deleteMood', id: mood.id })}
                    className="rounded p-2 text-[#656f58] hover:bg-[#eef1e8]"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {mood.note && (
                <p className="mt-4 whitespace-pre-wrap text-sm leading-7">
                  {mood.note}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </>
  );
}
