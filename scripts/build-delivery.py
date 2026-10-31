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
segments=json.loads((CAP/'segments.json').read_text(encoding='utf-8'))
instructions = [
 ('01 选择「角色设计」，开始独立创作','从左侧进入需要的功能，填写自己的设定。'),
 ('02 填写成果名称、创作需求和人物身份','名称方便以后查找；介绍说明你希望制作什么。'),
 ('03 补充人物性格、口头禅和技能','按已有想法填写，参考图片可选。'),
 ('04 点击「保存到创作资源库」','保存后可继续编辑，并保存为新的版本。'),
 ('05 打开「创作资源库」，找到保存的成果','使用搜索框或服务分类筛选。'),
 ('06 刷新后搜索成果，再进入「创作工作台」','已保存的成果可以留到以后继续使用。'),
 ('07 填写游戏名称与参考玩法，点击「保存草稿」','先保存游戏资料，再继续整理和确认方案。'),
]
for segment, (heading, hint) in zip(segments, instructions):
 frames=segment['frames'];duration=segment['durationMs'];cache={}
 for tick in range(140):
  ms=tick/140*duration
  idx=max(i for i,f in enumerate(frames) if f['ms']<=max(ms,frames[0]['ms']))
  if idx not in cache:
   shot=Image.open(CAP/frames[idx]['name']).convert('RGB');shot.thumbnail((1240,842))
   im=Image.new('RGB',(1280,960),'#f6f5f1');im.paste(shot,((1280-shot.width)//2,60))
   d=ImageDraw.Draw(im);d.rectangle((0,0,1280,58),fill='#161b24');d.text((24,12),heading,font=font(26),fill='white')
   d.text((24,920),hint,font=font(22),fill='#425f4e');cache[idx]=im
  emit(cache[idx],1)
proc.stdin.close()
if proc.wait()!=0:raise RuntimeError('视频编码失败')
print('video',video.stat().st_size)
