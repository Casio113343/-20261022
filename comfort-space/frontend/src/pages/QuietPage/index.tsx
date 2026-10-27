import { useEffect, useState } from 'react';
import { Leaf, Pause, Play, RotateCcw } from 'lucide-react';
import { PageHeading } from '../../components/ui';
import { useApp } from '../../state/AppProvider';

export function QuietPage() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const { state } = useApp();
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => setElapsed((n) => n + 1), 1000);
    return () => clearInterval(timer);
  }, [running]);
  useEffect(() => {
    if (elapsed >= 60) setRunning(false);
  }, [elapsed]);
  const breatheIn = elapsed % 8 < 4;
  return (
    <>
      <PageHeading
        eyebrow="TAKE A LITTLE BREATH"
        title="世界很快，这里可以慢一点。"
      >
        如果愿意，给自己一分钟。舒服地呼吸就好，不必刻意憋气或追赶节奏。
      </PageHeading>
      <section className="flex min-h-100 flex-col items-center justify-center rounded-[32px] border border-[#e6ebdd] bg-[radial-gradient(ellipse_at_50%_45%,#e1ead4_0%,#f3f6ec_60%,#f7f8f2_100%)] px-6 py-12">
        <div
          aria-hidden="true"
          className={`relative mb-8 flex size-44 items-center justify-center rounded-full border border-white/80 bg-white/30 shadow-[0_0_0_20px_#ffffff20,0_0_0_40px_#ffffff12] transition-transform duration-[3800ms] ${running && breatheIn && !state.preferences.reducedMotion ? 'scale-115' : 'scale-100'}`}
        >
          <Leaf size={40} className="text-[#60724c]" strokeWidth={0.8} />
        </div>
        <p aria-live="off" className="mb-3 font-serif text-2xl text-[#5d7347]">
          {elapsed >= 60
            ? '这一分钟，属于你。'
            : !running
              ? '先陪自己，安静一会儿。'
              : breatheIn
                ? '轻轻吸气'
                : '慢慢呼气'}
        </p>
        <p className="mb-8 text-xs text-[#657057]">
          {elapsed >= 60
            ? '想再待一会儿，也可以。'
            : `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')} / 01:00`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => {
              if (elapsed >= 60) setElapsed(0);
              setRunning((v) => !v);
            }}
            className="flex items-center gap-2 rounded-full bg-[#7b906a] px-6 py-3 text-xs text-white hover:bg-[#687e57]"
          >
            {running ? <Pause size={14} /> : <Play size={14} />}{' '}
            {running
              ? '停一停'
              : elapsed >= 60
                ? '再待一分钟'
                : elapsed
                  ? '继续'
                  : '开始这一分钟'}
          </button>
          <button
            aria-label="重新开始计时"
            onClick={() => {
              setElapsed(0);
              setRunning(false);
            }}
            className="rounded-full border border-[#dce5cf] p-3 text-[#5f724a]"
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </section>
      <p className="mt-6 text-center text-[11px] leading-6 text-[#647056]">
        这只是休息提示，不是训练任务。任何不舒服的时候，都可以停止，按自然节奏呼吸。
      </p>
    </>
  );
}
