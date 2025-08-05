// =============================================================================
// Quiz State Management Module
// =============================================================================

export class QuizState {
    constructor() {
        this.sessionId = window.QUIZ_SESSION_ID;
        this.currentQuestion = null;
        this.currentAnswer = null;
        this.isAnswered = false;
        this.quizCompleted = false;
        this.answers = new Map(); // Store answers for exam mode
        this.allQuestions = []; // Store all questions
        this.currentQuestionIndex = 0;
    }

    // State getters
    getCurrentQuestion() {
        return this.currentQuestion;
    }

    getCurrentAnswer() {
        return this.currentAnswer;
    }

    isQuestionAnswered() {
        return this.isAnswered;
    }

    isQuizCompleted() {
        return this.quizCompleted;
    }

    getSessionId() {
        return this.sessionId;
    }

    getCurrentQuestionIndex() {
        return this.currentQuestionIndex;
    }

    getTotalQuestions() {
        return this.allQuestions.length;
    }

    getAllQuestions() {
        return this.allQuestions;
    }

    // State setters
    setCurrentQuestion(question) {
        this.currentQuestion = question;
    }

    setCurrentAnswer(answer) {
        this.currentAnswer = answer;
    }

    setAnswered(answered) {
        this.isAnswered = answered;
    }

    setQuizCompleted(completed) {
        this.quizCompleted = completed;
    }

    setAllQuestions(questions) {
        this.allQuestions = questions;
    }

    setCurrentQuestionIndex(index) {
        this.currentQuestionIndex = index;
    }

    setCurrentQuestionNumber(questionNumber) {
        // Convert 1-based question number to 0-based index
        this.currentQuestionIndex = questionNumber - 1;
    }

    // State actions
    storeAnswer(questionId, answer) {
        this.answers.set(questionId, answer);
    }

    getStoredAnswer(questionId) {
        return this.answers.get(questionId);
    }

    hasStoredAnswer(questionId) {
        return this.answers.has(questionId);
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.allQuestions.length - 1) {
            this.currentQuestionIndex++;
            return true;
        }
        return false;
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            return true;
        }
        return false;
    }

    getProgressPercentage() {
        if (this.allQuestions.length === 0) return 0;
        return Math.round(((this.currentQuestionIndex + 1) / this.allQuestions.length) * 100);
    }

    reset() {
        this.currentQuestion = null;
        this.currentAnswer = null;
        this.isAnswered = false;
        this.quizCompleted = false;
        this.currentQuestionIndex = 0;
    }
} 