type JudgeResponse = {
    correct: boolean;
};

import { Question } from '../data/questions';

export async function isCorrectAnswer(
    input: string,
    question: Question
) {

    const response = await fetch('http://192.168.11.5:3000/judge', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            question: question.text,
            answer: input,
        }),
    });

    if (!response.ok) {
        throw new Error('判定APIでエラーが発生しました');
    }
    
    const data: JudgeResponse = await response.json();
    // questionの正解候補にinputが含まれているか返す
    return data.correct;
}