import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import {
  Box,
  LayoutDashboard,
  FolderOpen,
  ArrowUpRight,
  Code2,
} from "lucide-react";
import StudioPage from "./pages/StudioPage";
import ProjectsPage from "./pages/ProjectsPage";
import PlayPage from "./pages/PlayPage";
import ProductionPage from "./pages/ProductionPage";
export function Router() {
  return (
    <BrowserRouter>
      <div className="min-h-screen lg:pl-[216px]">
        <aside className="z-30 flex flex-col bg-[#161b24] px-5 py-6 text-white lg:fixed lg:inset-y-0 lg:left-0 lg:w-[216px]">
          <NavLink to="/studio" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5">
              <Box size={23} className="text-[#edb986]" />
            </span>
            <div>
              <strong className="text-base tracking-wide">造游工坊</strong>
              <span className="mt-0.5 block text-[9px] tracking-[.16em] text-white/40">
                GAME WORKSHOP
              </span>
            </div>
          </NavLink>
          <div className="mt-10 hidden text-[10px] tracking-widest text-white/30 lg:block">
            创作空间 / WORKSPACE
          </div>
          <nav className="mt-5 flex gap-2 lg:flex-col">
            <NavLink
              to="/studio"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${isActive ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5"}`
              }
            >
              <LayoutDashboard size={17} />
              创作工作台
            </NavLink>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${isActive ? "bg-white/10 text-white" : "text-white/50 hover:bg-white/5"}`
              }
            >
              <FolderOpen size={17} />
              我的作品
            </NavLink>
          </nav>
          <div className="mt-auto hidden pt-10 lg:block">
            <div className="rounded-xl border border-white/10 p-4">
              <Code2 size={18} className="mb-3 text-[#b5d7ba]" />
              <h3 className="text-xs">想法，正在成为作品。</h3>
              <p className="mt-2 text-[11px] leading-5 text-white/40">
                创作与素材版本管理
                <br />
                图片服务接入后可继续制作。
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-[10px] text-white/30">
              <span>DESIGNED TO CREATE</span>
              <ArrowUpRight size={13} />
            </div>
          </div>
        </aside>
        <div className="mx-auto max-w-[1510px] px-5 py-7 md:px-10 lg:py-8">
          <Routes>
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/production/:id" element={<ProductionPage />} />
            <Route path="/play/:id" element={<PlayPage />} />
            <Route path="*" element={<Navigate to="/studio" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}
