import { useState } from 'react';
import { Download, Trash2 } from 'lucide-react';
import { PageHeading, Toggle } from '../../components/ui';
import { useApp } from '../../state/AppProvider';
import { downloadData } from '../../system/storage';
import { savedPart } from '../../domain/reducer';

export function SettingsPage() {
  const { state, setApp } = useApp();
  const [confirm, setConfirm] = useState(false);
  const [notice, setNotice] = useState('');
  const update = (change: Partial<typeof state.preferences>) =>
    setApp({
      type: 'preferences',
      preferences: { ...state.preferences, ...change },
    });
  return (
    <>
      <PageHeading eyebrow="MAKE YOURSELF AT HOME" title="按你舒服的方式。">
        保存与离开，都由你决定。
      </PageHeading>
      <section className="rounded-3xl border border-[#e1e6d9] bg-white/70 px-6 py-3 sm:px-8">
        <div className="border-b border-[#e9ece2] py-6">
          <label htmlFor="nickname" className="mb-3 block text-sm font-medium">
            希望怎么称呼你？
          </label>
          <input
            id="nickname"
            maxLength={20}
            value={state.preferences.nickname}
            onChange={(event) => update({ nickname: event.target.value })}
            placeholder="留空也可以"
            className="w-full max-w-sm rounded-xl border border-[#e0e5d7] bg-[#fafbf6] px-4 py-3 text-sm outline-none focus:border-[#809572]"
          />
        </div>
        <Toggle
          checked={state.preferences.remember}
          onChange={(remember) => update({ remember })}
          label="在这台设备记住内容"
          description="默认关闭。开启后，对话、收藏、手记与偏好保存到当前浏览器；共享设备请谨慎开启。关闭会移除已保存副本，本次页面内容仍在。"
        />
        <Toggle
          checked={state.preferences.reducedMotion}
          onChange={(reducedMotion) => update({ reducedMotion })}
          label="减少动态效果"
          description="关闭呼吸圆圈的缩放和界面过渡。网站也会遵循设备的减少动态效果设置。"
        />
      </section>
      <section className="mt-6 rounded-3xl border border-[#e1e6d9] bg-white/50 p-6 sm:p-8">
        <h2 className="font-serif text-xl">属于你的内容</h2>
        <p className="mt-3 text-xs leading-6 text-[#676f5f]">
          导出文件包含对话和手记，请自行妥善保管。清空会取消正在等待的演示回复。
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => {
              downloadData(savedPart(state));
              setNotice('已发起下载。');
            }}
            className="flex items-center gap-2 rounded-full border border-[#dbe2d1] px-5 py-3 text-xs hover:bg-[#eef2e7]"
          >
            <Download size={15} />
            导出我的内容
          </button>
          <button
            onClick={() => setConfirm(true)}
            className="flex items-center gap-2 rounded-full border border-[#e7dcd2] px-5 py-3 text-xs text-[#8b634d] hover:bg-[#f5eee8]"
          >
            <Trash2 size={15} />
            清空所有内容
          </button>
        </div>
        {confirm && (
          <div
            role="alert"
            className="mt-5 rounded-xl bg-[#f5eee8] p-5 text-sm"
          >
            <p>确定清空全部对话、收藏、手记和偏好？此操作无法撤销。</p>
            <div className="mt-4 flex gap-5">
              <button
                onClick={() => {
                  setApp({ type: 'clear' });
                  setConfirm(false);
                  setNotice('内容已清空，本地保存已关闭。');
                }}
                className="font-medium text-[#985e42]"
              >
                确认清空
              </button>
              <button onClick={() => setConfirm(false)}>保留内容</button>
            </div>
          </div>
        )}
        <p role="status" className="mt-4 text-xs text-[#617156]">
          {notice}
        </p>
      </section>
    </>
  );
}
