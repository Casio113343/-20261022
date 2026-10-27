import { ArrowUp, Bookmark, Check, Sparkles } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import type { ComfortCard } from '../../data/cards';
import { useApp } from '../../state/AppProvider';

export function Brand({ small = false }: { small?: boolean }) {
  return (
    <span className="inline-flex items-center gap-3">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-[#607765] text-white">
        <Sparkles size={20} strokeWidth={1.4} />
      </span>
      <span className="leading-tight">
        <span className="block font-serif text-[25px] tracking-[.15em] text-[#34473c]">
          栖语
        </span>
        {!small && (
          <span className="mt-1 block text-[9px] tracking-[.25em] text-[#666f63]">
            A PLACE TO EXHALE
          </span>
        )}
      </span>
    </span>
  );
}
export function PageHeading({
  eyebrow,
  title,
  children,
  action,
}: {
  eyebrow: string;
  title: string;
  children?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <header className="mb-9 flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="mb-3 text-[10px] font-medium tracking-[.25em] text-[#64705d]">
          {eyebrow}
        </p>
        <h1 className="font-serif text-3xl leading-snug tracking-wide text-[#344238] sm:text-4xl">
          {title}
        </h1>
        {children && (
          <div className="mt-3 max-w-xl text-sm leading-7 text-[#676e62]">
            {children}
          </div>
        )}
      </div>
      {action}
    </header>
  );
}
export function Composer({
  onSend,
  busy = false,
  placeholder = '想从哪里说起，都可以。',
  large = false,
}: {
  onSend: (text: string) => boolean;
  busy?: boolean;
  placeholder?: string;
  large?: boolean;
}) {
  const [text, setText] = useState('');
  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    if (text.trim() && !busy && onSend(text)) setText('');
  };
  return (
    <form
      onSubmit={submit}
      className={`rounded-[22px] border border-[#dfe4d9] bg-white/85 p-4 shadow-[0_8px_30px_-20px_#71806a50] transition focus-within:border-[#8fa38b] focus-within:ring-3 focus-within:ring-[#7a95700c] ${large ? 'sm:p-6' : ''}`}
    >
      <label
        htmlFor={large ? 'home-thought' : 'chat-thought'}
        className="sr-only"
      >
        想说的话
      </label>
      <textarea
        id={large ? 'home-thought' : 'chat-thought'}
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={busy}
        maxLength={2000}
        rows={large ? 4 : 2}
        onKeyDown={(event) => {
          if (
            event.key === 'Enter' &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
          ) {
            event.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        className="w-full resize-none bg-transparent text-[15px] leading-8 text-[#465144] outline-none placeholder:text-[#686e62] disabled:opacity-60"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className="text-[11px] text-[#676e61]">
          {text.length > 1700
            ? `${text.length}/2000`
            : '不必组织语言，慢慢来就好'}
        </span>
        <button
          type="submit"
          disabled={busy || !text.trim()}
          aria-label="发送消息"
          className="flex size-10 items-center justify-center rounded-full bg-[#647b65] text-white transition hover:bg-[#4f6550] disabled:cursor-not-allowed disabled:bg-[#cbd4c5]"
        >
          <ArrowUp size={19} />
        </button>
      </div>
    </form>
  );
}
export function QuoteCard({ card }: { card: ComfortCard }) {
  const { state, setApp } = useApp();
  const saved = state.favourites.includes(card.id);
  const tones = {
    green: 'bg-[#eaf0e5]',
    sand: 'bg-[#f4efe4]',
    blue: 'bg-[#eaf0f1]',
  } as const;
  return (
    <article
      className={`group relative flex min-h-57 flex-col rounded-[20px] border border-black/[.025] p-6 transition hover:-translate-y-1 ${tones[card.tone]}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] tracking-[.1em] text-[#656f5b]">
          {card.tag}
        </span>
        <button
          onClick={() => setApp({ type: 'favourite', id: card.id })}
          aria-label={`${saved ? '取消收藏' : '收藏'}：${card.tag}`}
          className="rounded-full p-2 text-[#63705b] transition hover:bg-white/60"
        >
          {saved ? (
            <Bookmark size={16} fill="currentColor" />
          ) : (
            <Bookmark size={16} strokeWidth={1.5} />
          )}
        </button>
      </div>
      <p className="my-7 whitespace-pre-line font-serif text-xl leading-[1.8] tracking-wide text-[#4f5e48]">
        {card.text}
      </p>
      <p className="mt-auto text-[11px] text-[#676f5f]">{card.note}</p>
    </article>
  );
}
export function EmptyState({
  icon,
  title,
  children,
  action,
}: {
  icon?: ReactNode;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[#dce1d6] px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-full bg-[#edf0e8] text-[#617154]">
        {icon ?? <Sparkles size={22} strokeWidth={1.3} />}
      </div>
      <h2 className="font-serif text-xl text-[#58674f]">{title}</h2>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-[#676e60]">
        {children}
      </p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
export function Toggle({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-[#e9ece2] py-6 last:border-0">
      <div>
        <p className="text-sm font-medium text-[#53604c]">{label}</p>
        <p className="mt-2 max-w-md text-xs leading-6 text-[#676f5f]">
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${checked ? 'bg-[#71866b]' : 'bg-[#dfe3d8]'}`}
      >
        <span
          className={`absolute top-1 flex size-4 items-center justify-center rounded-full bg-white shadow-sm transition ${checked ? 'left-6' : 'left-1'}`}
        >
          {checked && <Check size={10} className="text-[#5e7153]" />}
        </span>
      </button>
    </div>
  );
}
