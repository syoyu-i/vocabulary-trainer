# 語彙トレアプリ開発 — Phase 2 振り返り

## Phase 2 のテーマ
**ゲームロジックを整理し、将来AI判定を導入できる構造にする。**

Phase 1で作った基本ゲームを、AI/API連携へ拡張しやすい構造へ整理した。

## Step 18：正誤判定を関数として分離
`submitAnswer()` 内の判定を `isCorrectAnswer()` に分離した。

```tsx
function isCorrectAnswer(input: string) {
  return currentQuestion.validAnswers.includes(input);
}
```

### なぜ？
ゲーム進行と正誤判定を別の仕事として扱うため。将来、固定リスト判定をAI判定へ交換しやすくなる。

**リファクタリング**：動作を変えずにコードの構造を改善すること。

## Step 19：Question型を定義

```tsx
type Question = {
  text: string;
  validAnswers: string[];
};

const questions: Question[] = [...];
```

`Question` は1問分のデータ構造、`Question[]` はQuestion型の配列。

TypeScriptの `:` は「左側の値は右側の型」という型指定に使う。

## Step 20：問題データを別ファイルへ分離

`data/questions.ts` を作成し、問題データと `Question` 型を移動した。

```tsx
export type Question = {
  text: string;
  validAnswers: string[];
};

export const questions: Question[] = [...];
```

`index.tsx` からは `import` して使用する。

```tsx
import { questions } from './data/questions';
```

- `export`：別ファイルから使えるようにする
- `import`：別ファイルでexportされたものを読み込む

## Step 21：ゲーム状態を整理

主なstate：

```tsx
const [isTraining, setIsTraining] = useState(false);
const [answer, setAnswer] = useState('');
const [answers, setAnswers] = useState<string[]>([]);
const [message, setMessage] = useState('');
const [questionIndex, setQuestionIndex] = useState(0);
```

一方、既存stateから計算できる値は新しいstateにせず、

```tsx
const currentQuestion = questions[questionIndex];
const isClear = answers.length >= 5;
```

とした。

### 重要
**何でも `useState` にする必要はない。**  
既存stateから計算できる値は普通の変数として表現できる。

## Step 22：async / await を導入

将来のAI/API判定では通信時間が発生するため、判定処理を非同期処理として扱える形へ変更した。

```tsx
async function isCorrectAnswer(input: string) {
  return currentQuestion.validAnswers.includes(input);
}
```

呼び出す側も、

```tsx
async function submitAnswer() {
  if (await isCorrectAnswer(trimmedAnswer)) {
    ...
  }
}
```

とした。

- `async`：その関数で非同期処理を扱えるようにする
- `await`：非同期処理の結果を待ってから続きを実行する

## Step 23：判定処理を別ファイルへ分離

`utils/answerJudge.ts` を作成。

```tsx
import { Question } from '../data/questions';

export async function isCorrectAnswer(
  input: string,
  question: Question
) {
  return question.validAnswers.includes(input);
}
```

`index.tsx` では、

```tsx
await isCorrectAnswer(trimmedAnswer, currentQuestion)
```

と呼び出す。

### 重要
関数に必要なデータを外部変数へ依存させず、**引数として渡す**ことで関数を独立させやすくなる。

この時点で役割は、

```text
index.tsx
→ UI・ゲーム進行・state管理

data/questions.ts
→ 問題データ

utils/answerJudge.ts
→ 正誤判定
```

となった。

## Step 24：判定中の状態を追加

AI判定では待ち時間が発生するため、

```tsx
const [isJudging, setIsJudging] = useState(false);
```

を追加。

判定開始時：

```tsx
setIsJudging(true);
```

判定終了時：

```tsx
setIsJudging(false);
```

UIでは、

```tsx
<Text>{isJudging ? '判定中...' : message}</Text>
```

さらに、

```tsx
<Button
  title="回答"
  onPress={submitAnswer}
  disabled={isJudging}
/>
```

として、判定中の連打を防いだ。

## Step 25：try / catch / finally

通信ではエラーが起こる可能性がある。

```tsx
try {
  if (await isCorrectAnswer(trimmedAnswer, currentQuestion)) {
    setAnswers([...answers, trimmedAnswer]);
    setMessage('正解！');
  } else {
    setMessage('不正解！');
  }
} catch {
  setMessage('判定に失敗しました');
} finally {
  setIsJudging(false);
}
```

- `try`：通常の処理
- `catch`：エラー発生時の処理
- `finally`：成功・失敗に関係なく最後に必ず行う処理

これにより、通信エラー時にも `isJudging` がtrueのまま残ることを防げる。

## Step 26：APIレスポンスの型

将来、バックエンドから、

```json
{
  "correct": true
}
```

というデータを返すことを想定し、

```tsx
type JudgeResponse = {
  correct: boolean;
};
```

を追加した。

これは「APIから返ってくるデータの形」の約束。

## Step 27：fetchによるAPI通信

将来の通信コードの基本形を確認した。

```tsx
const response = await fetch('http://APIのURL', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    question: question.text,
    answer: input,
  }),
});

const data: JudgeResponse = await response.json();

return data.correct;
```

### POST
今回はアプリから `question` と `answer` を送るためPOSTを使う。

### JSON.stringify()
JavaScriptオブジェクトを通信で送れるJSON文字列へ変換する。

### response.json()
APIから返ってきたJSONをJavaScriptで扱えるデータとして読み取る。

```text
JavaScriptオブジェクト
        ↓
JSON.stringify()
        ↓
      JSON
        ↓
       API
        ↓
      JSON
        ↓
response.json()
        ↓
JavaScriptで扱えるデータ
```

この段階ではAPIがまだ存在しないため、実際の `fetch()` への置き換えは行わなかった。

## Step 28：バックエンドとは何か

これまで作っていたExpo / React Nativeアプリは主に**フロントエンド**。

フロントエンド：
- お題を表示
- 入力を受け取る
- ボタンを表示
- 結果を表示

バックエンド：
- アプリから回答を受け取る
- LLMへ問い合わせる
- 判定結果を返す
- APIキーなど秘密情報を管理する

最終的には、

```text
iPhone / Expo
     ↓
自分のバックエンド
     ↓
LLM API
     ↓
自分のバックエンド
     ↓
iPhone / Expo
```

という構成を目指す。

### なぜExpoからLLMを直接呼ばない？
APIキーをExpoアプリ内へ直接埋め込むと、配布したアプリ側から秘密情報を取り出される危険があるため。

そのため秘密情報はバックエンド側で管理する。

## Step 29：バックエンドプロジェクトを作成

プロジェクト内にバックエンド用フォルダを作った。

```bash
mkdir backend
cd backend
```

Node.jsプロジェクトとして初期化：

```bash
npm init -y
```

Expressをインストール：

```bash
npm install express
```

主に以下が作成された。

```text
backend/
├── node_modules/
├── package.json
└── package-lock.json
```

- `package.json`：プロジェクト設定・使用ライブラリ
- `package-lock.json`：実際にインストールされた依存関係の詳細
- `node_modules/`：ライブラリ本体

ExpressはNode.jsでWeb APIを作りやすくするライブラリ。

---

# Phase 2終了時点の構成

概念的には、

```text
vocabulary-trainer/
│
├── index.tsx
│   ├── UI
│   ├── state管理
│   └── ゲーム進行
│
├── data/
│   └── questions.ts
│       ├── Question型
│       └── 問題データ
│
├── utils/
│   └── answerJudge.ts
│       └── 正誤判定
│
└── backend/
    ├── package.json
    ├── package-lock.json
    └── node_modules/
```

という役割分担になった。

---

# Phase 2で覚えた重要概念

1. **リファクタリング** — 動作を変えず構造を改善する
2. **TypeScriptの型** — データ構造を明示する
3. **`Question[]`** — Question型の配列
4. **export / import** — ファイル間で機能やデータを共有する
5. **派生値** — stateから計算できるものは必ずしもstateにしない
6. **async / await** — 時間のかかる非同期処理を扱う
7. **処理中state** — `isJudging` で判定中UIを管理する
8. **try / catch / finally** — エラーに強い処理を書く
9. **JSON** — フロントエンドとバックエンド間のデータ交換形式
10. **fetch** — Web APIへ通信する
11. **POST** — APIへデータを送る
12. **フロントエンド / バックエンド** — 表示・操作部分と裏側の処理を分ける

---

# Phase 1 → Phase 2でどう変わったか

Phase 1終了時：

```text
ユーザー入力
↓
index.tsx
↓
固定リスト判定
↓
画面更新
```

Phase 2終了時：

```text
             ┌→ questions.ts
             │   問題データ
             │
index.tsx ───┤
 UI・進行    │
             └→ answerJudge.ts
                 判定処理
                      ↓
                将来 fetch()
                      ↓
                  backend
                      ↓
                     LLM
```

つまりPhase 2では、ゲームそのものを大きく変えるのではなく、**将来AIやバックエンドを接続できる構造へ整理した**。

---

# Phase 3の目標

Phase 3では、実際にバックエンドを動かす。

まず目指すのは、

```text
iPhoneのExpoアプリ
       ↓
     POST
       ↓
PC上のExpressサーバー
       ↓
 { correct: true }
       ↓
iPhoneのExpoアプリ
```

という最小の通信。

最初からLLMには接続せず、

```text
固定レスポンス
↓
フロントエンドとの通信確認
↓
実際の判定API
↓
LLM API
```

と段階的に進める。

## Phase 2の一言まとめ

**「動くゲーム」から「AIやバックエンドを後から接続できるアプリ構造」へ進化させたフェーズ。**
