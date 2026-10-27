import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bookmark } from 'lucide-react';
import { cards } from '../../data/cards';
import { EmptyState, PageHeading, QuoteCard } from '../../components/ui';
import { useApp } from '../../state/AppProvider';

export function LibraryPage({ saved = false }: { saved?: boolean }) {
  const { state } = useApp();
  const [filter, setFilter] = useState('全部');
  const available = saved
    ? cards.filter((card) => state.favourites.includes(card.id))
    : cards;
  const tags = ['全部', ...new Set(available.map((card) => card.tag))];
  const activeFilter = tags.includes(filter) ? filter : '全部';
  const shown =
    activeFilter === '全部'
      ? available
      : available.filter((card) => card.tag === activeFilter);
  return (
    <>
      <PageHeading
        eyebrow={saved ? 'LITTLE LIGHTS YOU KEEP' : 'A FEW WORDS FOR TODAY'}
        title={saved ? '收藏的微光' : '拾一句温柔'}
      >
        {saved
          ? '把那些刚好接住你的话，留在伸手就能找到的地方。'
          : '不一定能解决所有问题，但或许有一句，刚好陪到现在的你。'}
      </PageHeading>
      {!available.length ? (
        <EmptyState
          icon={<Bookmark size={23} strokeWidth={1.2} />}
          title="让喜欢的话，在这里停留"
          action={
            <Link
              to="/library"
              className="inline-flex items-center gap-2 text-xs underline"
            >
              去拾一句温柔 <ArrowRight size={13} />
            </Link>
          }
        >
          遇到想留下的一句话，点一下右上角的收藏标记。
        </EmptyState>
      ) : (
        <>
          <div aria-label="安慰卡片筛选" className="mb-7 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                aria-pressed={activeFilter === tag}
                className={`rounded-full px-4 py-2 text-[11px] transition ${activeFilter === tag ? 'bg-[#7d906b] text-white' : 'border border-[#e3e9d8] text-[#637051] hover:bg-[#edf2e5]'}`}
              >
                {tag}
              </button>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {shown.map((card) => (
              <QuoteCard card={card} key={card.id} />
            ))}
          </div>
        </>
      )}
    </>
  );
}
