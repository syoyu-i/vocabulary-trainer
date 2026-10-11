import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { questions } from '../../data/questions';
import { isCorrectAnswer } from '../../utils/answerJudge';

export default function HomeScreen() {
  const [isTraining, setIsTraining] = useState(false);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isJudging, setIsJudging] = useState(false);
  const currentQuestion = questions[questionIndex];
  const isClear = answers.length >= 5;

  function startTraining() {
    setQuestionIndex(Math.floor(Math.random() * questions.length));
    setAnswers([]);
    setAnswer('');
    setMessage('');
    setIsTraining(true);
  }

  function katakanaToHiragana(text: string) {
    return text.replace(/[\u30a1-\u30f6]/g, (match) => {
      const chr = match.charCodeAt(0) - 0x60;
      return String.fromCharCode(chr);
    });
  }
  
  function normalizeAnswer(text: string) {
    const normalized = text
      .trim()
      .toLowerCase()
      .normalize('NFKC');
    return katakanaToHiragana(normalized);
  }

  async function submitAnswer() {
    const trimmedAnswer = answer.trim();
    // 空欄ならここで終了
    if (trimmedAnswer === '') {
      return;
    }
    // 回答済みならここで終了
    if (
      answers.some(
        (item) => normalizeAnswer(item) === normalizeAnswer(trimmedAnswer)
      )
    ) {
      setMessage('回答済みです');
      setAnswer('');
      return;
    }
    // isCorrectAnswer関数を呼び出して正誤判定
    setIsJudging(true);
    try {
      if (await isCorrectAnswer(trimmedAnswer, currentQuestion)) {
        // trimmedAnswerをanswersへ追加
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

    // Answerを空文字に戻す
    setAnswer('');
  }

  function nextQuestion() {
    setQuestionIndex((questionIndex + 1) % questions.length);
    setAnswers([]);
    setAnswer('');
    setMessage('');
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isTraining ? (
        //<View>
        isClear ? (
          // クリア画面
          <View>
            <Text style={{ fontSize:32 }}>クリア！</Text>
            <Button title="次の問題" onPress={nextQuestion} />
          </View>
        ) : (
          // 回答画面
          <View>
            <Text>「{currentQuestion.text}」を5つ答えよう！</Text>
            <TextInput 
              placeholder="回答を入力"
              onChangeText={setAnswer}
              value={answer} 
            />
            <Text>現在の回答：{answer}</Text>
            <Text>{isJudging ? '判定中...' : message}</Text>
            <Text>回答数：{answers.length}</Text>
            <Text>回答済み：</Text>
            {answers.map((item, index) => (
              <Text key={index}>{item}</Text>
            ))}
            <Button 
              title="回答" 
              onPress={submitAnswer} 
              disabled={isJudging}
            />
          </View>
        )
        //</View>
      ) : (
        <View>
          <Text style={{ fontSize: 32 }}>語彙トレ！</Text>
          <Button title="トレーニング開始" onPress={startTraining} />
        </View>
      )
      }
    </View>
  );
}
