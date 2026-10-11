export type Question = {
  text: string;
  validAnswers: string[];
};

export const questions: Question[] = [
  {
    text: '赤いもの',
    validAnswers: ['りんご', 'トマト', 'いちご', '血', '消防車'],
  },
  {
    text: '丸いもの',
    validAnswers: ['ボール', '月', '時計', 'お椀', 'UFO'],
  },
  {
    text: '学校にあるもの',
    validAnswers: ['机', '黒板', '教科書', 'ほうき', 'ちりとり'],
  },
];