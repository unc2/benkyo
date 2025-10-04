// アプリケーションの状態管理
class QuizApp {
    constructor() {
        this.currentMode = null; // 'mock' or 'memorize'
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.currentAnswers = [];
        this.score = 0;
        this.categoryScores = {};
        
        this.initializeEventListeners();
        this.loadQuizData();
    }

    initializeEventListeners() {
        // モード選択
        document.getElementById('mock-exam-btn').addEventListener('click', () => {
            this.startQuiz('mock');
        });

        document.getElementById('memorize-btn').addEventListener('click', () => {
            this.startQuiz('memorize');
        });

        // ナビゲーション
        document.getElementById('back-btn').addEventListener('click', () => {
            this.goHome();
        });

        document.getElementById('submit-answer').addEventListener('click', () => {
            this.submitAnswer();
        });

        document.getElementById('next-question').addEventListener('click', () => {
            this.nextQuestion();
        });

        // 結果画面
        document.getElementById('retry-btn').addEventListener('click', () => {
            this.retryQuiz();
        });

        document.getElementById('home-btn').addEventListener('click', () => {
            this.goHome();
        });
    }

    loadQuizData() {
        // quiz-data.jsから問題データを読み込み
        if (typeof quizData !== 'undefined') {
            this.questions = quizData;
        } else {
            console.error('Quiz data not loaded');
        }
    }

    startQuiz(mode) {
        this.currentMode = mode;
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.currentAnswers = [];
        this.score = 0;
        this.categoryScores = {};

        // 問題をシャッフル
        this.questions = this.shuffleArray([...quizData]);

        this.showScreen('quiz-screen');
        this.updateModeIndicator();
        this.displayQuestion();
    }

    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    updateModeIndicator() {
        const indicator = document.getElementById('mode-indicator');
        if (this.currentMode === 'mock') {
            indicator.textContent = '模擬試験モード';
            indicator.className = 'mode-indicator mock';
        } else {
            indicator.textContent = '暗記モード';
            indicator.className = 'mode-indicator memorize';
        }
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        this.currentAnswers = [];

        // 進捗表示
        document.getElementById('current-question').textContent = this.currentQuestionIndex + 1;
        document.getElementById('total-questions').textContent = this.questions.length;

        // 問題情報
        document.getElementById('question-category').textContent = question.category;
        document.getElementById('question-difficulty').textContent = this.getDifficultyText(question.difficulty);
        document.getElementById('question-difficulty').className = `difficulty ${question.difficulty}`;

        // 問題文
        document.getElementById('question-text').textContent = question.description;

        // 問題画像
        const questionImage = document.getElementById('question-image');
        if (question.imageUrl) {
            questionImage.src = question.imageUrl;
            questionImage.style.display = 'block';
        } else {
            questionImage.style.display = 'none';
        }

        // 選択肢を表示
        this.displayChoices(question);

        // ボタンの状態をリセット
        document.getElementById('submit-answer').disabled = true;
        document.getElementById('submit-answer').style.display = 'inline-block';
        document.getElementById('next-question').style.display = 'none';
        document.getElementById('explanation-container').style.display = 'none';
    }

    getDifficultyText(difficulty) {
        const difficultyMap = {
            'easy': '初級',
            'normal': '中級',
            'hard': '上級'
        };
        return difficultyMap[difficulty] || difficulty;
    }

    displayChoices(question) {
        const container = document.getElementById('choices-container');
        container.innerHTML = '';

        question.choices.forEach((choice, index) => {
            const choiceElement = document.createElement('div');
            choiceElement.className = 'choice-item';
            choiceElement.dataset.choiceId = choice.id;

            const inputElement = document.createElement('div');
            if (question.questionType === 'single') {
                inputElement.className = 'choice-radio';
            } else {
                inputElement.className = 'choice-checkbox';
            }

            const textElement = document.createElement('div');
            textElement.className = 'choice-text';
            textElement.textContent = choice.text;

            choiceElement.appendChild(inputElement);
            choiceElement.appendChild(textElement);

            // 選択肢画像
            if (choice.imageUrl) {
                const imageElement = document.createElement('img');
                imageElement.src = choice.imageUrl;
                imageElement.className = 'choice-image';
                imageElement.alt = '選択肢画像';
                choiceElement.appendChild(imageElement);
            }

            // クリックイベント
            choiceElement.addEventListener('click', () => {
                this.selectChoice(choice.id, question.questionType);
            });

            container.appendChild(choiceElement);
        });
    }

    selectChoice(choiceId, questionType) {
        if (questionType === 'single') {
            // 単一選択: 他の選択を解除
            this.currentAnswers = [choiceId];
            document.querySelectorAll('.choice-item').forEach(item => {
                const radio = item.querySelector('.choice-radio');
                if (item.dataset.choiceId == choiceId) {
                    item.classList.add('selected');
                    radio.classList.add('checked');
                } else {
                    item.classList.remove('selected');
                    radio.classList.remove('checked');
                }
            });
        } else {
            // 複数選択: トグル
            const choiceElement = document.querySelector(`[data-choice-id="${choiceId}"]`);
            const checkbox = choiceElement.querySelector('.choice-checkbox');
            
            if (this.currentAnswers.includes(choiceId)) {
                this.currentAnswers = this.currentAnswers.filter(id => id !== choiceId);
                choiceElement.classList.remove('selected');
                checkbox.classList.remove('checked');
            } else {
                this.currentAnswers.push(choiceId);
                choiceElement.classList.add('selected');
                checkbox.classList.add('checked');
            }
        }

        // 回答ボタンの有効化
        document.getElementById('submit-answer').disabled = this.currentAnswers.length === 0;
    }

    submitAnswer() {
        const question = this.questions[this.currentQuestionIndex];
        const isCorrect = this.checkAnswer(question.answers, this.currentAnswers);

        // 回答を保存
        this.userAnswers[this.currentQuestionIndex] = {
            questionId: question.id,
            selectedAnswers: [...this.currentAnswers],
            correctAnswers: question.answers,
            isCorrect: isCorrect
        };

        if (isCorrect) {
            this.score++;
        }

        // カテゴリ別スコア更新
        if (!this.categoryScores[question.category]) {
            this.categoryScores[question.category] = { correct: 0, total: 0 };
        }
        this.categoryScores[question.category].total++;
        if (isCorrect) {
            this.categoryScores[question.category].correct++;
        }

        if (this.currentMode === 'memorize') {
            // 暗記モード: 即座に結果と解説を表示
            this.showAnswerResult(question, isCorrect);
        } else {
            // 模擬試験モード: 次の問題へ
            this.nextQuestion();
        }
    }

    checkAnswer(correctAnswers, userAnswers) {
        if (correctAnswers.length !== userAnswers.length) {
            return false;
        }
        
        const sortedCorrect = [...correctAnswers].sort((a, b) => a - b);
        const sortedUser = [...userAnswers].sort((a, b) => a - b);
        
        return sortedCorrect.every((answer, index) => answer === sortedUser[index]);
    }

    showAnswerResult(question, isCorrect) {
        // 選択肢の色分け
        document.querySelectorAll('.choice-item').forEach(item => {
            const choiceId = parseInt(item.dataset.choiceId);
            item.classList.add('disabled');
            
            if (question.answers.includes(choiceId)) {
                item.classList.add('correct');
            } else if (this.currentAnswers.includes(choiceId)) {
                item.classList.add('incorrect');
            }
        });

        // 結果表示
        const resultText = document.getElementById('result-text');
        if (isCorrect) {
            resultText.textContent = '正解！';
            resultText.className = 'correct';
        } else {
            resultText.textContent = '不正解';
            resultText.className = 'incorrect';
        }

        // 解説表示
        document.getElementById('explanation-text').textContent = question.explanation || '解説がありません。';
        document.getElementById('explanation-container').style.display = 'block';

        // ボタンの切り替え
        document.getElementById('submit-answer').style.display = 'none';
        document.getElementById('next-question').style.display = 'inline-block';
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        } else {
            // クイズ終了
            if (this.currentMode === 'mock') {
                this.showResults();
            } else {
                this.goHome();
            }
        }
    }

    showResults() {
        this.showScreen('result-screen');

        const percentage = Math.round((this.score / this.questions.length) * 100);
        const isPass = percentage >= 70; // 70%以上で合格

        // スコア表示
        document.getElementById('score-percentage').textContent = `${percentage}%`;
        document.getElementById('score-detail').textContent = `${this.score}/${this.questions.length} 問正解`;

        // 合格/不合格表示
        const passFailElement = document.getElementById('pass-fail-indicator');
        if (isPass) {
            passFailElement.textContent = '合格';
            passFailElement.className = 'pass-fail pass';
        } else {
            passFailElement.textContent = '不合格';
            passFailElement.className = 'pass-fail fail';
        }

        // カテゴリ別結果表示
        this.displayCategoryResults();
    }

    displayCategoryResults() {
        const container = document.getElementById('category-breakdown');
        container.innerHTML = '';

        Object.entries(this.categoryScores).forEach(([category, scores]) => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'category-item';

            const nameElement = document.createElement('div');
            nameElement.className = 'category-name';
            nameElement.textContent = category;

            const scoreElement = document.createElement('div');
            scoreElement.className = 'category-score';
            const percentage = Math.round((scores.correct / scores.total) * 100);
            scoreElement.textContent = `${scores.correct}/${scores.total} (${percentage}%)`;

            categoryElement.appendChild(nameElement);
            categoryElement.appendChild(scoreElement);
            container.appendChild(categoryElement);
        });
    }

    retryQuiz() {
        this.startQuiz(this.currentMode);
    }

    goHome() {
        this.showScreen('home-screen');
        this.currentMode = null;
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
}

// アプリケーション初期化
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});