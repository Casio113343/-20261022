"""将本次真实浏览器采集帧编码为演示录像，并打包可复现源码。"""
from pathlib import Path
import json,sys,subprocess,zipfile,hashlib
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'outputs/delivery-20261031';OUT.mkdir(parents=True,exist_ok=True)
CAP=ROOT/'game-workshop/.runtime/delivery-video'
sys.path.insert(0,str(ROOT/'game-workshop/.tools/video-python'))
import imageio_ffmpeg
FFMPEG=imageio_ffmpeg.get_ffmpeg_exe()
FONT='C:/Windows/Fonts/msyh.ttc'
def font(n):return ImageFont.truetype(FONT,n)
def card(title,lines):
 im=Image.new('RGB',(1280,960),'#161b24');d=ImageDraw.Draw(im)
 d.text((70,110),title,font=font(43),fill='#b5d7ba')
 for i,line in enumerate(lines):d.text((70,240+i*65),line,font=font(27),fill='white')
 d.text((70,870),'造游工坊 | 前端 React + TypeScript · 后端 Scala 3 · PostgreSQL',font=font(22),fill='#bbbbbb')
 return im
video=OUT/'造游工坊-使用演示.mp4'
cmd=[FFMPEG,'-y','-f','rawvideo','-vcodec','rawvideo','-pix_fmt','rgb24','-s','1280x960','-r','10','-i','-','-an','-c:v','libx264','-preset','fast','-crf','24','-pix_fmt','yuv420p','-movflags','+faststart',str(video)]
proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stderr=open(OUT/'encoding.log','wb'))
def emit(im,n):
 raw=im.tobytes()
 for _ in range(n):proc.stdin.write(raw)
emit(card('造游工坊 · 使用流程演示',['六个独立创作服务 + 统一资源库 + 游戏工作台','本片包含真实页面操作与标明的后端说明页。','演示：角色填写 → 保存 → 刷新检索 → 游戏草稿','真实 AI 模型尚未配置；不展示虚构生成结果。']),120)
segments=json.loads((CAP/'segments.json').read_text(encoding='utf-8'))
for segment in segments:
 frames=segment['frames'];duration=segment['durationMs'];cache={}
 for tick in range(140):
  ms=tick/140*duration
  idx=max(i for i,f in enumerate(frames) if f['ms']<=max(ms,frames[0]['ms']))
  if idx not in cache:
   shot=Image.open(CAP/frames[idx]['name']).convert('RGB');shot.thumbnail((1240,842))
   im=Image.new('RGB',(1280,960),'#f6f5f1');im.paste(shot,((1280-shot.width)//2,60))
   d=ImageDraw.Draw(im);d.rectangle((0,0,1280,58),fill='#161b24');d.text((24,12),segment['label'],font=font(26),fill='white')
   d.text((24,920),'实际浏览器操作采集 | 当前未连接真实模型，不将参考图当作生成图',font=font(22),fill='#425f4e');cache[idx]=im
  emit(cache[idx],1)
emit(card('后端说明 · 独立 AI 生成链路',['六类服务各有独立 Generate / Save / List 接口。','生成任务持久化：查询状态、明确重试、用户隔离。','AI 结果先保存为候选，用户确认后建立资源版本。','图片保存原图与加工图；失败不覆盖原有成果。','配置缺失返回 waiting_for_provider，前端按钮尚未接线。']),200)
emit(card('GitHub 后端源码链接',['github.com/Casio113343/-20261022/tree/main/','game-workshop/backend','AI 生成接口：services/generation/api','完整链接在 ZIP 根目录的「提交说明.md」中。','源码版本：5d316477420ca6fe5591da1ff93725dfeec789ec']),200)
emit(card('交付范围与验证',['源码 ZIP 包含前后端、锁文件、脚本和运行说明。','前端 23 项测试、后端 30 项测试已通过。','本次录像未完成资源接入确认后的操作演示。','没有录制真实 AI 绘图或最终游戏生成。','片长 2 分 48 秒；源码包与视频合计小于 100 MB。']),180)
proc.stdin.close()
if proc.wait()!=0:raise RuntimeError('视频编码失败')
print('video',video.stat().st_size)
