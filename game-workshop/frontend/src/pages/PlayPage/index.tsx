import { Link, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Gamepad2, ShieldCheck, RefreshCw } from "lucide-react";
import { TurnGame } from "./components/TurnGame";
import { TowerGame } from "./components/TowerGame";
import { MobaGame } from "./components/MobaGame";
import { usePlay } from "./hooks/usePlay";
import { secondary } from "../../components/ui/Field";
function PlayWorkspace({
  id,
  version,
}: {
  id: string;
  version: string | null;
}) {
  const p = usePlay(id, version);
  const state = p.state;
  const game = state.status === "ready" ? state.game : null;
  return (
    <main className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
        <div>
          <p className="mb-2 text-xs tracking-widest text-accent">
            PLAY YOUR PROTOTYPE
          </p>
          <h1 className="text-3xl font-semibold">
            {game?.title || "图形原型试玩"}
          </h1>
        </div>
        <Link to={`/production/${id}`} className={secondary}>
          <ArrowLeft size={15} />
          返回制作与素材
        </Link>
      </header>
      {state.status !== "ready" ? (
        <div className="rounded-2xl border border-line bg-white p-8">
          <Gamepad2 size={28} className="mb-4 text-mint" />
          <p
            role={state.status === "error" ? "alert" : "status"}
            className="text-sm leading-7 text-muted"
          >
            {state.message}
          </p>
          {state.status === "error" && (
            <button className={`${secondary} mt-4`} onClick={p.retry}>
              <RefreshCw size={14} />
              重新加载全部图片
            </button>
          )}
        </div>
      ) : (
        <>
          <div
            role="status"
            className="flex items-start gap-3 rounded-xl border border-mint/20 bg-mint/5 p-4"
          >
            <ShieldCheck size={20} className="shrink-0 text-mint" />
            <p className="text-xs leading-6 text-muted">
              已校验并加载 {state.game.artworkBindings?.length} 项绑定美术 ·
              方案版本 {state.game.version}
              。战斗规则仍为简化模板，自由文本技能尚未自动执行；刷新会重新开始本局。
              {state.synthetic && (
                <strong className="block text-amber-900">
                  当前使用测试服务生成的合成图片，仅验证界面和素材加载，不代表正式美术效果。
                </strong>
              )}
            </p>
          </div>
          <details className="rounded-xl border border-line bg-white p-4">
            <summary className="cursor-pointer text-sm font-medium">
              世界背景与角色档案
            </summary>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">
              {state.game.world.background || "未提供世界背景"}
            </p>
            {state.game.characters.map((c, i) => (
              <p key={c.id} className="mt-3 text-xs leading-6 text-muted">
                <strong className="text-ink">{c.name || `人物${i + 1}`}</strong>{" "}
                · {c.personality} · {c.catchphrase}
                <br />
                技能设想（未执行）：{c.skills || "未填写"}
              </p>
            ))}
          </details>
          {state.game.genreId === "moba" ? (
            <MobaGame game={state.game} assets={state.assets} />
          ) : state.game.genreId === "tower-defense" ? (
            <TowerGame game={state.game} assets={state.assets} />
          ) : (
            <TurnGame game={state.game} assets={state.assets} />
          )}
        </>
      )}
    </main>
  );
}
export default function PlayPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const version = params.get("version");
  return (
    <PlayWorkspace key={`${id}:${version}`} id={id ?? ""} version={version} />
  );
}
