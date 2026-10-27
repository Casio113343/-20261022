export type ComfortCard = Readonly<{
  id: string;
  tag: string;
  text: string;
  note: string;
  tone: 'green' | 'sand' | 'blue';
}>;
export const cards: readonly ComfortCard[] = [
  {
    id: 'rest',
    tag: '给疲惫的你',
    text: '不是每一刻，\n都需要有所收获。',
    note: '休息也是生活的一部分。',
    tone: 'green',
  },
  {
    id: 'pace',
    tag: '允许慢一点',
    text: '你有属于自己的节奏，\n不必和谁同时到达。',
    note: '今天走到这里，也很好。',
    tone: 'sand',
  },
  {
    id: 'feel',
    tag: '接住此刻',
    text: '说不清的感受，\n也值得被认真听见。',
    note: '不必先整理好，再开口。',
    tone: 'blue',
  },
  {
    id: 'ordinary',
    tag: '普通的一天',
    text: '今天只是普通地度过，\n也没有关系。',
    note: '你不需要每天都证明自己。',
    tone: 'sand',
  },
  {
    id: 'unfinished',
    tag: '放下一点',
    text: '那些没想明白的事，\n可以明天再想。',
    note: '今晚，先把自己安顿好。',
    tone: 'blue',
  },
  {
    id: 'worth',
    tag: '对自己温柔',
    text: '一次不如意，\n装不下全部的你。',
    note: '你比那个结果更丰富。',
    tone: 'green',
  },
];
