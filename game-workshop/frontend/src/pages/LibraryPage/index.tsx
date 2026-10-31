import { useState } from "react";
import { Link } from "react-router-dom";
import type { ResourceKind } from "../../objects/library";
import { resourceKinds } from "../../objects/library";
import { useLibrary } from "./hooks/useLibrary";
import { ResourceEditor } from "./components/ResourceEditor";
import { secondary } from "../../components/ui/Field";
export default function LibraryPage({
  mode,
  service,
}: {
  mode: "services" | "library";
  service?: ResourceKind;
}) {
  const l = useLibrary(service);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const visible = l.resources.filter((r) => {
    const d = r.history.at(-1)?.data;
    return (
      d &&
      (filter === "all" || d.kind === filter) &&
      `${d.title} ${d.description}`.includes(query)
    );
  });
  return (
    <main className="space-y-7">
      <header className="border-b border-line pb-6">
        <p className="text-xs tracking-widest text-accent">
          CREATIVE CONNECTIONS
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          {mode === "services"
            ? (resourceKinds.find((k) => k.id === l.draft.kind)?.name ??
              "独立创作")
            : "创作资源库"}
        </h1>
        <p className="mt-3 text-sm leading-7 text-muted">
          独立创作，保存成果，再把它们连接成游戏。已选用的版本由你决定何时更新。
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            className={secondary}
            to={mode === "services" ? "/library" : "/character"}
          >
            {mode === "services" ? "查看已保存成果" : "开始新的小创作"}
          </Link>
          <Link className={secondary} to="/studio">
            前往创作工作台
          </Link>
        </div>
      </header>
      <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber-900">
        当前可填写、编辑和保存独立成果。AI
        自由创作与真实图片服务尚未接入；不会将制作要求或参考上传图标记为已生成图片。已有生成素材可从制作页保存到资源库。
      </p>
      {l.error && (
        <div
          role="alert"
          className="rounded-xl bg-red-50 p-4 text-sm text-red-800"
        >
          {l.error}
          <button className="ml-3 underline" onClick={l.reload}>
            重新读取
          </button>
        </div>
      )}
      {l.notice && (
        <p
          role="status"
          className="rounded-xl bg-mint/10 p-4 text-sm text-mint"
        >
          {l.notice}
        </p>
      )}
      {!l.ready ? (
        <p>正在读取资源库…</p>
      ) : (
        <>
          {mode === "library" && (
            <section className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <label className="flex-1 text-xs">
                  搜索资源
                  <input
                    aria-label="搜索资源"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </label>
                <label className="text-xs">
                  服务分类
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">全部服务</option>
                    {resourceKinds.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {!visible.length ? (
                <p className="rounded-xl border border-dashed border-line p-7 text-sm text-muted">
                  还没有匹配的资源。先去小服务保存一项成果。
                </p>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {visible.map((r) => (
                    <button
                      key={r.id}
                      disabled={l.busy}
                      onClick={() => l.select(r)}
                      className="rounded-xl border border-line bg-white p-5 text-left"
                    >
                      <p className="text-xs text-mint">
                        {
                          resourceKinds.find(
                            (k) => k.id === r.history.at(-1)?.data.kind,
                          )?.name
                        }{" "}
                        · v{r.version}
                      </p>
                      <h2 className="mt-2 font-semibold">
                        {r.history.at(-1)?.data.title}
                      </h2>
                      <p className="mt-2 line-clamp-2 text-xs leading-6 text-muted">
                        {r.history.at(-1)?.data.description || "点击查看与编辑"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}
          <ResourceEditor
            draft={l.draft}
            onChange={l.setDraft}
            current={l.current}
            busy={l.busy}
            token={l.session?.token}
            onSave={() => void l.save()}
          />
        </>
      )}
    </main>
  );
}
