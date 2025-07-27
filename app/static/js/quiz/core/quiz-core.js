/**
 * =============================================================================
 * QUIZ CORE - MAIN QUIZ LOGIC
 * =============================================================================
 * 
 * Bu dosya quiz'in ana mantığını yönetir.
 * Quiz akışını, soru geçişlerini ve genel durumu kontrol eder.
 * 
 * Sorumlulukları:
 * - Quiz durumunu yönetmek
 * - Soru geçişlerini kontrol etmek
 * - Cevap doğrulamasını yapmak
 * - Quiz sonlandırma işlemlerini yönetmek
 * - Event'leri tetiklemek
 */

import { QuizState } from './quiz-state.js';

export class QuizCore {
    constructor(dataManager, eventBus) {
        this.dataManager = dataManager;
        this.eventBus = eventBus;
        this.state = new QuizState();
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.timer = null;
    }

    startQuiz() {
        this.state.setStatus('active');
        this.currentQuestionIndex = 0;
        this.answers = [];
        this.eventBus.emit('quiz:started');
        this.eventBus.emit('quizStarted', { totalQuestions: this.dataManager.getTotalQuestions() });
        
        // Start timer when quiz begins
        this.startTimer();
        
        this.loadQuestion();
    }

    loadQuestion() {
        const question = this.dataManager.getQuestion(this.currentQuestionIndex);
        if (question) {
            this.eventBus.emit('question:loaded', { question, index: this.currentQuestionIndex });
            // Timer is not restarted for each question anymore
        } else {
            this.endQuiz();
        }
    }

    selectAnswer(answerIndex) {
        if (this.state.getStatus() !== 'active') return;
        
        // Check if this question was already answered
        const wasAnswered = this.answers[this.currentQuestionIndex] !== undefined;
        
        // Update answer
        this.answers[this.currentQuestionIndex] = answerIndex;
        
        // Emit answer selected event
        this.eventBus.emit('answer:selected', { 
            questionIndex: this.currentQuestionIndex, 
            answerIndex,
            wasAnswered
        });
        
        // Emit answerSubmitted event for navigation UI
        this.eventBus.emit('answerSubmitted', { 
            questionIndex: this.currentQuestionIndex, 
            answerIndex 
        });

        // Auto-advance to next question after a short delay
        setTimeout(() => {
            this.nextQuestion();
        }, 500); // 500ms delay for user to see the selection
    }

    nextQuestion() {
        if (this.currentQuestionIndex < this.dataManager.getTotalQuestions() - 1) {
            this.currentQuestionIndex++;
            this.eventBus.emit('questionChanged', { questionIndex: this.currentQuestionIndex });
            this.loadQuestion();
        } else {
            this.endQuiz();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.eventBus.emit('questionChanged', { questionIndex: this.currentQuestionIndex });
            this.loadQuestion();
        }
    }

    skipQuestion() {
        // Mark question as skipped (undefined answer)
        this.answers[this.currentQuestionIndex] = undefined;
        
        // Emit skip event
        this.eventBus.emit('questionSkipped', { 
            questionIndex: this.currentQuestionIndex 
        });
        
        // Go to next question
        this.nextQuestion();
    }

    startTimer() {
        // Timer is started once when quiz begins
        // It will continue running throughout the entire quiz
        this.eventBus.emit('timer:started');
    }

    endQuiz() {
        this.state.setStatus('completed');
        const results = this.calculateResults();
        this.eventBus.emit('quiz:completed', results);
    }

    calculateResults() {
        const totalQuestions = this.dataManager.getTotalQuestions();
        const correctAnswers = this.answers.filter((answer, index) => {
            const question = this.dataManager.getQuestion(index);
            return question && answer === question.correctAnswer;
        }).length;

        return {
            totalQuestions,
            correctAnswers,
            score: Math.round((correctAnswers / totalQuestions) * 100),
            answers: this.answers
        };
    }

    getCurrentQuestion() {
        return this.dataManager.getQuestion(this.currentQuestionIndex);
    }

    getCurrentIndex() {
        return this.currentQuestionIndex;
    }

    getCurrentQuestionIndex() {
        return this.currentQuestionIndex;
    }

    getTotalQuestions() {
        return this.dataManager.getTotalQuestions();
    }

    isQuestionAnswered(questionIndex) {
        return this.answers[questionIndex] !== undefined;
    }

    isQuestionSkipped(questionIndex) {
        return this.answers[questionIndex] === undefined;
    }

    goToQuestion(questionIndex) {
        if (questionIndex >= 0 && questionIndex < this.dataManager.getTotalQuestions()) {
            this.currentQuestionIndex = questionIndex;
            this.eventBus.emit('questionChanged', { questionIndex });
            this.loadQuestion();
        }
    }

    getCurrentAnswer() {
        return this.answers[this.currentQuestionIndex];
    }

    getState() {
        return this.state;
    }
} 