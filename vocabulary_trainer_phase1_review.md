# 語彙トレアプリ開発 — Phase 1 振り返り

## Phase 1：React Native / Expo の基礎を使ってゲームの骨格を作る

このフェーズでは、**React Native + Expo + TypeScript の基本を触りながら、語彙トレーニングゲームの最小構成を実際に動かす**ことを目標とした。

最終的に、以下の流れまで実装した。

```text
アプリ起動
  ↓
「トレーニング開始」
  ↓
ランダムに問題を選択
  ↓
回答を入力
  ↓
正解 / 不正解 / 回答済みを判定
  ↓
正解した回答を記録
  ↓
5個正解するとクリア
  ↓
次の問題へ
```

---

## Step 1：Expo 開発環境を作る

### やったこと

- Node.js / npm をインストール
- Expo プロジェクト `vocabulary-trainer` を作成
- Expo の開発サーバーを起動
- iPhone に Expo Go をインストール
- QRコードから実機でアプリを起動

### 覚えたこと

Expo を使うことで、React Native アプリを比較的簡単に実機で確認できる。

開発中は基本的に、

```text
PC上のコード
  ↓
Expo開発サーバー
  ↓
iPhoneのExpo Go
```

という形で動作確認する。

---

## Step 2：最小の画面を作る

### やったこと

Expo のサンプル画面を削除し、

```tsx
<View>
  <Text>語彙トレ！</Text>
</View>
```

だけの画面を作った。

### 覚えたこと

React Native では、UIを**コンポーネントの組み合わせ**として作る。

- `View`：UIをまとめる箱
- `Text`：文字を表示する
- `HomeScreen`：画面を表すコンポーネント

---

## Step 3：style で画面を整える

### やったこと

「語彙トレ！」を画面中央に表示し、文字を大きくした。

### 覚えたこと

```tsx
style={{
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
}}
```

などを使ってUIの配置を変更できる。

特に今回使ったものは以下。

- `flex: 1`：利用可能な領域を埋める
- `alignItems: 'center'`：横方向の中央寄せ
- `justifyContent: 'center'`：縦方向の中央寄せ
- `fontSize`：文字サイズ

---

## Step 4：Button と onPress を使う

### やったこと

「トレーニング開始」ボタンを追加し、押したときに関数を実行した。

```tsx
<Button title="トレーニング開始" onPress={startTraining} />
```

### 覚えたこと

`onPress`には、ボタンを押したときに実行したい**関数そのもの**を渡す。

```tsx
onPress={startTraining}
```

と

```tsx
onPress={startTraining()}
```

は違う。

前者は「押されたときに実行」、後者は「その場ですぐ実行」になる。

---

## Step 5：useState で画面の状態を持つ

### やったこと

```tsx
const [isTraining, setIsTraining] = useState(false);
```

を作り、ボタンを押すと

```text
語彙トレ！
↓
トレーニング中！
```

と表示が変わるようにした。

### 覚えたこと

`state` は、**画面の表示に影響する変化するデータ**を保持するために使う。

```tsx
setIsTraining(true);
```

によってstateが変わると、Reactが画面を再描画する。

---

## Step 6：条件付きレンダリング

### やったこと

`isTraining` に応じて、表示するUIそのものを変更した。

```tsx
{isTraining ? (
  // トレーニング画面
) : (
  // 開始画面
)}
```

### 覚えたこと

三項演算子を使うことで、stateに応じて異なるUIを表示できる。

また、複数のUI部品をまとめる場合は `<View>` で囲む。

---

## Step 7：TextInput の入力をstateに保存する

### やったこと

```tsx
const [answer, setAnswer] = useState('');
```

を作り、TextInput と接続した。

```tsx
<TextInput
  onChangeText={setAnswer}
/>
```

### 覚えたこと

ユーザーが文字を入力するたびに、`answer` の内容が更新される。

```text
ユーザー入力
  ↓
state変更
  ↓
UI再描画
```

というReactの基本的な流れを確認した。

---

## Step 8：複数回答を配列stateに保存する

### やったこと

```tsx
const [answers, setAnswers] = useState<string[]>([]);
```

を追加した。

回答ボタンを押すと、

```tsx
setAnswers([...answers, answer]);
```

で回答を追加するようにした。

### 覚えたこと

`string[]` は文字列の配列。

```tsx
[...answers, answer]
```

の `...` はスプレッド構文で、既存の配列の内容を展開して新しい要素を追加できる。

また、

```tsx
answers.length
```

で回答数を取得できる。

---

## Step 9：map で回答一覧を表示する

### やったこと

```tsx
{answers.map((item, index) => (
  <Text key={index}>{item}</Text>
))}
```

によって、回答済みの単語を一覧表示した。

### 覚えたこと

`map` は、配列の各要素を別のものに変換するときに使える。

Reactでは特に、

```text
データの配列
↓ map
UI部品の配列
```

という使い方を頻繁にする。

---

## Step 10：空欄回答を防ぐ

### やったこと

```tsx
if (answer.trim() === '') {
  return;
}
```

を追加した。

### 覚えたこと

- `if`：条件分岐
- `return`：その時点で関数の処理を終了
- `trim()`：文字列の前後の空白を除去

これによって空文字や空白だけの回答を登録しないようにした。

---

## Step 11：5個回答したらクリア

### やったこと

```tsx
answers.length >= 5
```

を条件として、回答画面から「クリア！」画面へ切り替えた。

### 覚えたこと

すでに存在するstateから計算できる情報なら、必ずしも新しいstateを作る必要はない。

今回は、

```tsx
const [isClear, setIsClear] = useState(false);
```

を追加しなくても、`answers.length` からクリア状態を判断できた。

---

## Step 12：固定の正解リストで正誤判定する

### やったこと

正解候補を用意し、

```tsx
validAnswers.includes(answer)
```

で入力された回答が正解候補に含まれるか判定した。

### 覚えたこと

`includes()` を使うと、配列の中に指定した値が存在するか確認できる。

この段階ではAI判定を使わず、ゲームロジックを先に完成させる方針とした。

---

## Step 13：重複判定と正解・不正解メッセージ

### やったこと

```tsx
const [message, setMessage] = useState('');
```

を追加した。

回答によって、

```text
正解！
不正解！
回答済みです
```

を表示するようにした。

また、

```tsx
const trimmedAnswer = answer.trim();
```

を作り、整形した回答を判定や保存に利用した。

### 覚えたこと

同じ入力値を複数箇所で使う場合、最初に整形済みの値を変数として作っておくと処理が分かりやすくなる。

---

## Step 14：問題をオブジェクトにまとめる

### やったこと

問題文と正解候補を、

```tsx
const question = {
  text: '赤いもの',
  validAnswers: [...],
};
```

という1つのオブジェクトにまとめた。

### 覚えたこと

関連するデータはオブジェクトとしてまとめられる。

```tsx
question.text
question.validAnswers
```

のように各データへアクセスできる。

---

## Step 15：複数の問題を配列で管理する

### やったこと

```tsx
const questions = [
  {
    text: '赤いもの',
    validAnswers: [...],
  },
  {
    text: '丸いもの',
    validAnswers: [...],
  },
  ...
];
```

という構造に変更した。

さらに、

```tsx
const [questionIndex, setQuestionIndex] = useState(0);
const currentQuestion = questions[questionIndex];
```

によって現在の問題を管理した。

### 覚えたこと

```tsx
questions[0]
questions[1]
```

のように配列から特定の問題を取得できる。

また、「現在どの問題を表示しているか」のような変化する値はstateで管理できる。

---

## Step 16：次の問題へ進む

### やったこと

クリア画面に「次の問題」ボタンを追加した。

```tsx
setQuestionIndex((questionIndex + 1) % questions.length);
```

によって、

```text
0 → 1 → 2 → 0 → ...
```

と問題を循環させた。

同時に、

```tsx
setAnswers([]);
setAnswer('');
setMessage('');
```

で問題ごとの状態をリセットした。

### 覚えたこと

画面や問題を切り替える場合、関連するstateも適切に初期化する必要がある。

`%`（剰余）を使うと、一定範囲の番号を循環させられる。

---

## Step 17：開始時に問題をランダム選択する

### やったこと

トレーニング開始時に、

```tsx
setQuestionIndex(
  Math.floor(Math.random() * questions.length)
);
```

で問題をランダムに選択するようにした。

### 覚えたこと

- `Math.random()`：0以上1未満のランダムな小数
- `Math.floor()`：小数点以下を切り捨て

組み合わせることで、問題配列のランダムなindexを生成できる。

---

# Phase 1 で学んだ重要概念

このフェーズで特に重要だったものをまとめる。

### React / React Native

- コンポーネント
- JSX
- `View`
- `Text`
- `Button`
- `TextInput`
- `style`
- `onPress`
- `onChangeText`

### State

```tsx
const [value, setValue] = useState(initialValue);
```

を使って、画面上で変化するデータを管理した。

今回作ったstateは、

```tsx
isTraining
answer
answers
message
questionIndex
```

など。

最も重要な流れは、

```text
ユーザーが操作
↓
stateを変更
↓
Reactが再描画
↓
画面が変化
```

というもの。

### JavaScript / TypeScript

- 関数
- `if`
- `return`
- 三項演算子
- 配列
- オブジェクト
- `map()`
- `includes()`
- `trim()`
- `length`
- スプレッド構文 `...`
- `%`（剰余）
- `Math.random()`
- `Math.floor()`
- `string[]`

---

# Phase 1 終了時点のアプリ

現時点では、以下が実装済み。

- Expo GoでiPhone実機動作
- トレーニング開始画面
- 複数のお題を保持
- 開始時にランダムで問題を選択
- テキストによる回答入力
- 空欄回答の防止
- 固定正解リストによる正誤判定
- 重複回答の防止
- 正解 / 不正解 / 回答済みメッセージ
- 正解済み回答一覧
- 5個正解でクリア
- 次の問題への切り替え

## 現在の大きな制約

正誤判定が、

```tsx
validAnswers: [...]
```

という**事前に登録した固定リストに依存している**。

例えば「赤いもの」に対して「夕焼け」のような妥当な回答をしても、リストに存在しなければ不正解になる。

---

# 次のフェーズ

Phase 2 では、練習用の実装から少しずつ**実際に作りたい語彙トレーニングアプリの構造**へ移行する。

まず、

```text
問題を出す処理
回答を受け取る処理
回答が正しいか判定する処理
```

などを整理し、役割ごとに分離する。

そのうえで将来的に、

```text
固定リストによる判定
        ↓
LLMなどによる柔軟な判定
```

へ交換しやすい構造を目指す。

