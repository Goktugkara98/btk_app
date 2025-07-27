/**
 * =============================================================================
 * QUIZ STATE - STATE MANAGEMENT
 * =============================================================================
 * 
 * Bu dosya quiz'in durumunu yönetir.
 * Quiz'in hangi aşamada olduğunu ve durumunu takip eder.
 * 
 * Sorumlulukları:
 * - Quiz durumunu (status) yönetmek
 * - Durum geçişlerini kontrol etmek
 * - Durum değişikliklerini event olarak yayınlamak
 * - Durum geçmişini tutmak
 */

export class QuizState {
    constructor() {
        this.status = 'idle'; // idle, active, paused, completed, error
        this.currentQuestion = 0;
        this.selectedAnswer = null;
        this.timeRemaining = 0;
        this.isTimerRunning = false;
        this.stateHistory = [];
    }

    setStatus(newStatus) {
        const oldStatus = this.status;
        this.status = newStatus;
        this.stateHistory.push({
            timestamp: Date.now(),
            from: oldStatus,
            to: newStatus
        });
    }

    getStatus() {
        return this.status;
    }

    setCurrentQuestion(index) {
        this.currentQuestion = index;
    }

    getCurrentQuestion() {
        return this.currentQuestion;
    }

    setSelectedAnswer(answerIndex) {
        this.selectedAnswer = answerIndex;
    }

    getSelectedAnswer() {
        return this.selectedAnswer;
    }

    setTimeRemaining(time) {
        this.timeRemaining = time;
    }

    getTimeRemaining() {
        return this.timeRemaining;
    }

    setTimerRunning(isRunning) {
        this.isTimerRunning = isRunning;
    }

    isTimerRunning() {
        return this.isTimerRunning;
    }

    getStateHistory() {
        return this.stateHistory;
    }

    reset() {
        this.status = 'idle';
        this.currentQuestion = 0;
        this.selectedAnswer = null;
        this.timeRemaining = 0;
        this.isTimerRunning = false;
        this.stateHistory = [];
    }
} 