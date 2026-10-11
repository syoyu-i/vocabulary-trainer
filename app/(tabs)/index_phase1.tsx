import { useState } from 'react';
import { View, Text, Button, TextInput } from 'react-native';

const questions = [
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

export default function HomeScreen() {
  const [isTraining, setIsTraining] = useState(false);
  const [answer, setAnswer] = useState('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const currentQuestion = questions[questionIndex];

  function startTraining() {
    setQuestionIndex(Math.floor(Math.random() * questions.length));
    setAnswers([]);
    setAnswer('');
    setMessage('');
    setIsTraining(true);
  }

  function submitAnswer() {
    const trimmedAnswer = answer.trim();
    // 空欄ならここで終了
    if (trimmedAnswer === '') {
      return;
    }

    if (answers.includes(trimmedAnswer)) {
      setMessage('回答済みです');
      setAnswer('');
      return;
    }

    if (currentQuestion.validAnswers.includes(trimmedAnswer)) {
      // trimmedAnswerをanswersへ追加
      setAnswers([...answers, trimmedAnswer]);
      setMessage('正解！');
    } else {
      setMessage('不正解！');
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
        answers.length >= 5 ? (
          <View>
            <Text style={{ fontSize:32 }}>クリア！</Text>
            <Button title="次の問題" onPress={nextQuestion} />
          </View>
        ) : (
          <View>
            <Text>「{currentQuestion.text}」を5つ答えよう！</Text>
            <TextInput 
              placeholder="回答を入力"
              onChangeText={setAnswer}
              value={answer} 
            />
            <Text>現在の回答：{answer}</Text>
            <Text>{message}</Text>
            <Text>回答数：{answers.length}</Text>
            <Text>回答済み：</Text>
            {answers.map((item, index) => (
              <Text key={index}>{item}</Text>
            ))}
            <Button title="回答" onPress={submitAnswer} />
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
