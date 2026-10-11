const questions = require('./data/questions');
const express = require('express');

const app = express();
const port = 3000;

function katakanaToHiragana(text) {
    return text.replace(/[\u30a1-\u30f6]/g, (char) =>
        String.fromCharCode(char.charCodeAt(0) - 0x60)
    );
}

function normalizeAnswer(text) {
    const normalized = text
        .trim()
        .toLowerCase()
        .normalize('NFKC');
    return katakanaToHiragana(normalized);
}

async function isSemanticMatch(answer, validAnswers) {
    return false;
}

app.use(express.json());

app.post('/judge', async (req,res) => {
    //console.log(req.body);
    const question = req.body.question;
    const answer = req.body.answer;
    //console.log('question:', question);
    //console.log('answer:', answer);
    console.log('POST /judge が届きました');

    if (!question || !answer) {
        return res.status(400).json({
            error: 'questionとanswerは必須です',
        });
    }

    const matchedQuestion = questions.find(
        (item) => item.text === question
    );

    if (!matchedQuestion) {
        return res.status(404).json({
            error: '問題が見つかりません',
        });
    }

    // let correct = false;
    const normalizedAnswer = normalizeAnswer(answer);

    const exactMatch = matchedQuestion.validAnswers.some(
        (validAnswer) => normalizeAnswer(validAnswer) === normalizedAnswer
    );

    // correct = matchedQuestion.validAnswers.includes(answer);
    if (exactMatch) {
        return res.json({
            correct: true,
        });
    }

    // ここに将来LLM判定を入れる

    const semanticMatch = await isSemanticMatch(
        normalizedAnswer,
        matchedQuestion.validAnswers
    );

    return res.json({
        correct: semanticMatch,
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});