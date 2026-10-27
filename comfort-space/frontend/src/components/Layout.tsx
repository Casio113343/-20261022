import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  BookHeart,
  Bookmark,
  Coffee,
  Feather,
  History,
  Home,
  Leaf,
  Menu,
  MessageCircle,
  Settings2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Brand } from './ui';
import { useApp } from '../state/AppProvider';

const navigation = [
  { to: '/', label: '此刻，停靠', icon: Home, end: true },
  { to: '/chat', label: '聊一会儿', icon: MessageCircle, end: false },
  { to: '/history', label: '往日对话', icon: History, end: false },
] as const;
const spaceNavigation = [
  { to: '/library', label: '拾一句温柔', icon: BookHeart },
  { to: '/saved', label: '收藏的微光', icon: Bookmark },
  { to: '/quiet', label: '安静片刻', icon: Coffee },
  { to: '/mood', label: '心情手记', icon: Feather },
] as const;
export function Layout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { state, storageError } = useApp();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);
  const itemClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-xl px-4 py-3 text-[13px] transition ${isActive ? 'bg-[#e6ecdf] font-medium text-[#56694d]' : 'text-[#676e60] hover:bg-[#edf0e8] hover:text-[#5d6f53]'}`;
  return (
    <div
      className={`min-h-screen bg-[#f8f9f4] text-[#4e5b46] ${state.preferences.reducedMotion ? 'reduce-motion' : ''}`}
    >
      {open && (
        <button
          aria-label="关闭导航遮罩"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/20 lg:hidden"
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col overflow-y-auto border-r border-[#e8ece1] bg-[#f3f5ed] px-5 py-8 transition-transform lg:visible lg:translate-x-0 ${open ? 'visible translate-x-0' : 'invisible -translate-x-full'}`}
      >
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="mb-13 px-4"
          aria-label="栖语首页"
        >
          <Brand />
        </Link>
        <button
          onClick={() => setOpen(false)}
          aria-label="关闭导航"
          className="absolute right-4 top-5 rounded p-2 lg:hidden"
        >
          <X size={18} />
        </button>
        <nav
          aria-label="主导航"
          onClick={() => setOpen(false)}
          className="space-y-1"
        >
          {navigation.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={itemClass}>
              <Icon size={17} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>
        <p className="mb-3 mt-9 px-4 text-[9px] tracking-[.2em] text-[#676e5e]">
          给自己的空间
        </p>
        <nav
          aria-label="个人空间"
          onClick={() => setOpen(false)}
          className="space-y-1"
        >
          {spaceNavigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={itemClass}>
              <Icon size={17} strokeWidth={1.5} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-10">
          <div className="mb-6 rounded-2xl border border-[#e0e6d8] bg-[#eef2e7] p-4">
            <Leaf size={18} className="mb-3 text-[#607150]" strokeWidth={1.4} />
            <p className="font-serif text-[13px] leading-7 text-[#607153]">
              不用成为更好的谁，
              <br />
              先好好地做自己。
            </p>
          </div>
          <NavLink
            to="/settings"
            className={itemClass}
            onClick={() => setOpen(false)}
          >
            <Settings2 size={17} strokeWidth={1.5} />
            我的偏好
          </NavLink>
          <Link
            to="/about"
            onClick={() => setOpen(false)}
            className="mt-3 flex items-center justify-between px-4 text-[10px] text-[#686f5d]"
          >
            关于栖语 <ArrowUpRight size={12} />
          </Link>
        </div>
      </aside>
      <div className="lg:pl-60">
        <header className="flex h-20 items-center justify-between border-b border-[#edf0e7] px-5 sm:px-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              aria-label="打开导航"
              className="rounded-lg p-2 text-[#627057] lg:hidden"
            >
              <Menu size={20} />
            </button>
            <p className="text-[11px] tracking-wider text-[#676f5c]">
              一处停靠，一点温柔
            </p>
          </div>
          <Link
            to="/about"
            className="flex items-center gap-2 rounded-full border border-[#e1e7d8] bg-[#f0f3e9] px-3 py-1.5 text-[10px] text-[#627054]"
          >
            <span className="size-1.5 rounded-full bg-[#93a57e]" />
            演示模式
          </Link>
        </header>
        {storageError && (
          <div
            role="alert"
            className="mx-5 mt-3 rounded-xl bg-amber-50 p-3 text-xs text-amber-800"
          >
            本机保存未成功，可能是空间不足或内容过多。本次内容仍可查看，刷新后可能丢失。
          </div>
        )}
        <main
          key={location.pathname}
          className="mx-auto w-full max-w-[1240px] px-5 pb-9 pt-9 sm:px-10 lg:px-12 lg:pt-11"
        >
          <Outlet />
        </main>
        <footer className="mx-5 flex flex-wrap justify-between gap-3 border-t border-[#e8ece1] py-5 text-[10px] text-[#686e5f] sm:mx-10 lg:mx-12">
          <span>栖语 · 让心事有处安放</span>
          <div className="flex gap-5">
            <Link
              to="/privacy"
              className="flex items-center gap-1 hover:text-[#5c7252]"
            >
              <ShieldCheck size={11} />
              隐私与数据
            </Link>
            <Link to="/about" className="hover:text-[#5c7252]">
              使用说明
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
