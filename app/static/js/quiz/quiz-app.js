// =============================================================================
// Quiz App - Main Application
// Yeni session-based quiz sistemi için ana uygulama
// =============================================================================

import { QuizUI } from './ui/quiz-ui.js';
import { TimerUI } from './ui/timer-ui.js';
import { NavigationUI } from './ui/navigation-ui.js';
import { EventBus } from './utils/event-bus.js';

class QuizApp {
    constructor() {
        this.sessionId = window.QUIZ_SESSION_ID;
        this.currentQuestion = null;
        this.currentAnswer = null;
        this.isAnswered = false;
        this.quizCompleted = false;
        
        // UI Components
        this.eventBus = new EventBus();
        this.quizUI = new QuizUI(this, this.eventBus);
        this.timerUI = new TimerUI(this, this.eventBus);
        this.navigationUI = new NavigationUI(this, this.eventBus);
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Quiz App başlatılıyor...');
            console.log('📋 Session ID:', this.sessionId);
            
            // Session ID kontrolü
            if (!this.sessionId) {
                this.showError('Quiz oturumu bulunamadı');
                return;
            }

            // Quiz durumunu kontrol et
            await this.checkSessionStatus();
            
            // İlk soruyu yükle
            await this.loadCurrentQuestion();
            
            // Event listener'ları bağla
            this.bindEvents();
            
            console.log('✅ Quiz App başlatıldı');
            
        } catch (error) {
            console.error('❌ Quiz başlatılırken hata:', error);
            this.showError('Quiz başlatılırken bir hata oluştu: ' + error.message);
        }
    }

    async checkSessionStatus() {
        try {
            console.log('🔍 Session durumu kontrol ediliyor...');
            
            const response = await fetch(`/api/quiz/session/${this.sessionId}/status`);
            const data = await response.json();
            
            console.log('📡 Session status response:', data);
            
            if (data.status === 'success') {
                const sessionData = data.data;
                
                // Quiz tamamlanmış mı kontrol et
                if (sessionData.is_completed) {
                    this.quizCompleted = true;
                    const finalResults = await this.getFinalResults();
                    this.showQuizCompleted(finalResults);
                    return;
                }
                
                // Timer ayarlarını güncelle
                if (sessionData.timer_enabled) {
                    this.timerUI.setTimer(sessionData.timer_duration * 60);
                    this.timerUI.start();
                    console.log('⏰ Timer başlatıldı:', sessionData.timer_duration, 'dakika');
                } else {
                    this.timerUI.hide();
                    console.log('⏰ Timer devre dışı');
                }
                
                // Progress'i güncelle
                this.updateProgress(sessionData.progress_percentage);
                
            } else {
                throw new Error(data.message || 'Oturum durumu alınamadı');
            }
        } catch (error) {
            throw new Error('Oturum durumu kontrol edilirken hata: ' + error.message);
        }
    }

    async loadCurrentQuestion() {
        try {
            console.log('📋 Soru yükleniyor...');
            this.showLoading();
            
            const response = await fetch(`/api/quiz/session/${this.sessionId}/question`);
            const data = await response.json();
            
            console.log('📡 Question response:', data);
            
            if (data.status === 'success') {
                this.currentQuestion = data.data;
                this.isAnswered = false;
                this.currentAnswer = null;
                
                console.log('📋 Current Question:', this.currentQuestion);
                
                // UI'yi güncelle
                this.quizUI.displayQuestion(this.currentQuestion);
                this.updateNavigation();
                this.updateProgress(this.currentQuestion.progress.percentage);
                
                this.hideLoading();
                this.showQuestion();
                
            } else {
                throw new Error(data.message || 'Soru yüklenemedi');
            }
        } catch (error) {
            throw new Error('Soru yüklenirken hata: ' + error.message);
        }
    }

    async submitAnswer(selectedOptionId) {
        if (this.isAnswered || this.quizCompleted) {
            console.log('⚠️ Cevap zaten verilmiş veya quiz tamamlanmış');
            return;
        }

        try {
            console.log('📤 Cevap gönderiliyor:', selectedOptionId);
            this.isAnswered = true;
            this.navigationUI.disableNavigation();
            
            // API'ye gönderilecek veri
            const requestData = {
                question_id: this.currentQuestion.question.id,
                user_answer_option_id: this.currentQuestion.question.options[selectedOptionId].id
            };
            
            console.log('📤 Request data:', requestData);
            
            const response = await fetch(`/api/quiz/session/${this.sessionId}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData)
            });

            const data = await response.json();
            console.log('📥 Answer response:', data);
            
            if (data.status === 'success') {
                const result = data.data;
                
                // Cevap sonucunu göster
                this.showAnswerFeedback(result);
                
                // Progress'i güncelle
                this.updateProgress(result.progress.percentage);
                
                // Quiz tamamlandı mı kontrol et
                if (result.quiz_completed) {
                    this.quizCompleted = true;
                    this.timerUI.stop();
                    this.showQuizCompleted(result.final_score);
                }
                
            } else {
                throw new Error(data.message || 'Cevap gönderilemedi');
            }
        } catch (error) {
            console.error('❌ Cevap gönderilirken hata:', error);
            this.showError('Cevap gönderilirken bir hata oluştu: ' + error.message);
            this.isAnswered = false;
            this.navigationUI.enableNavigation();
        }
    }

    async nextQuestion() {
        if (this.quizCompleted) {
            console.log('🏁 Quiz tamamlanmış, sonraki soru yok');
            return;
        }

        try {
            console.log('➡️ Sonraki soru yükleniyor...');
            await this.loadCurrentQuestion();
        } catch (error) {
            console.error('❌ Sonraki soru yüklenirken hata:', error);
            this.showError('Sonraki soru yüklenirken bir hata oluştu: ' + error.message);
        }
    }

    async getFinalResults() {
        try {
            const response = await fetch(`/api/quiz/session/${this.sessionId}/results`);
            const data = await response.json();
            
            if (data.status === 'success') {
                return data.data;
            } else {
                throw new Error(data.message || 'Sonuçlar alınamadı');
            }
        } catch (error) {
            console.error('❌ Final results alınırken hata:', error);
            throw error;
        }
    }

    bindEvents() {
        console.log('🔗 Event listener\'lar bağlanıyor...');
        
        // Quiz UI events
        this.eventBus.on('optionSelected', (optionId) => {
            console.log('🎯 Option selected:', optionId);
            this.submitAnswer(optionId);
        });

        // Navigation events
        this.eventBus.on('nextQuestion', () => {
            console.log('➡️ Next question event');
            this.nextQuestion();
        });

        // Timer events
        this.eventBus.on('timerExpired', () => {
            console.log('⏰ Timer expired');
            this.handleTimerExpired();
        });

        // Manual button events
        document.getElementById('next-question-btn')?.addEventListener('click', () => {
            console.log('🔘 Next question button clicked');
            this.nextQuestion();
        });

        document.getElementById('retry-btn')?.addEventListener('click', () => {
            console.log('🔘 Retry button clicked');
            this.init();
        });

        document.getElementById('view-results-btn')?.addEventListener('click', () => {
            console.log('🔘 View results button clicked');
            this.viewResults();
        });

        document.getElementById('new-quiz-btn')?.addEventListener('click', () => {
            console.log('🔘 New quiz button clicked');
            this.startNewQuiz();
        });
    }

    showAnswerFeedback(result) {
        console.log('🎯 Showing answer feedback:', result);
        
        const feedbackContainer = document.getElementById('answer-feedback');
        const feedbackIcon = document.getElementById('feedback-icon');
        const feedbackTitle = document.getElementById('feedback-title');
        const feedbackExplanation = document.getElementById('feedback-explanation');
        
        // Feedback icon ve title'ı güncelle
        if (result.is_correct) {
            feedbackIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
            feedbackTitle.textContent = 'Doğru!';
            feedbackIcon.className = 'feedback-icon correct';
        } else {
            feedbackIcon.innerHTML = '<i class="fas fa-times-circle"></i>';
            feedbackTitle.textContent = 'Yanlış!';
            feedbackIcon.className = 'feedback-icon incorrect';
        }
        
        // Açıklamayı güncelle
        feedbackExplanation.textContent = result.explanation || 'Açıklama bulunmuyor.';
        
        // Feedback'i göster
        this.hideQuestion();
        feedbackContainer.style.display = 'block';
        
        console.log('✅ Answer feedback shown');
    }

    showQuizCompleted(finalScore) {
        console.log('🏆 Quiz completed, showing results:', finalScore);
        
        const completionContainer = document.getElementById('quiz-completed');
        
        // Sonuçları güncelle
        document.getElementById('correct-answers').textContent = finalScore.correct_answers;
        document.getElementById('total-questions-final').textContent = finalScore.total_questions;
        document.getElementById('success-rate').textContent = `${finalScore.score_percentage}%`;
        document.getElementById('time-taken').textContent = this.formatTime(finalScore.time_taken);
        
        // Completion ekranını göster
        this.hideAllStates();
        completionContainer.style.display = 'block';
    }

    handleTimerExpired() {
        if (!this.isAnswered && !this.quizCompleted) {
            console.log('⏰ Timer expired, auto-submitting first option');
            this.submitAnswer(0);
        }
    }

    updateProgress(percentage) {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${percentage}%`;
        }
        
        console.log('📊 Progress updated:', percentage + '%');
    }

    updateNavigation() {
        if (this.currentQuestion) {
            // Current question number
            document.getElementById('current-question').textContent = this.currentQuestion.question_number;
            document.getElementById('total-questions').textContent = this.currentQuestion.total_questions;
            
            // Navigation buttons
            const prevBtn = document.getElementById('prev-btn');
            const nextBtn = document.getElementById('next-btn');
            
            if (prevBtn) {
                prevBtn.disabled = this.currentQuestion.question_number <= 1;
            }
            if (nextBtn) {
                nextBtn.disabled = !this.isAnswered;
            }
            
            console.log('🧭 Navigation updated:', {
                current: this.currentQuestion.question_number,
                total: this.currentQuestion.total_questions,
                answered: this.isAnswered
            });
        }
    }

    showLoading() {
        this.hideAllStates();
        document.getElementById('loading-state').style.display = 'block';
    }

    hideLoading() {
        document.getElementById('loading-state').style.display = 'none';
    }

    showQuestion() {
        this.hideAllStates();
        document.getElementById('question-container').style.display = 'block';
    }

    hideQuestion() {
        document.getElementById('question-container').style.display = 'none';
    }

    hideAllStates() {
        document.getElementById('loading-state').style.display = 'none';
        document.getElementById('question-container').style.display = 'none';
        document.getElementById('answer-feedback').style.display = 'none';
        document.getElementById('quiz-completed').style.display = 'none';
        document.getElementById('error-state').style.display = 'none';
    }

    showError(message) {
        console.error('❌ Error:', message);
        this.hideAllStates();
        document.getElementById('error-message').textContent = message;
        document.getElementById('error-state').style.display = 'block';
    }

    viewResults() {
        // Quiz sonuçları sayfasına yönlendir
        window.location.href = `/quiz/results/${this.sessionId}`;
    }

    startNewQuiz() {
        // Quiz başlatma sayfasına yönlendir
        window.location.href = '/quiz/start';
    }

    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // Core methods that QuizUI expects
    getCurrentAnswer() {
        return this.currentAnswer;
    }

    selectAnswer(optionIndex) {
        console.log(`🎯 Answer selected: ${optionIndex}`);
        this.currentAnswer = optionIndex;
        this.submitAnswer(optionIndex);
    }

    getCurrentIndex() {
        return this.currentQuestion ? this.currentQuestion.question_number - 1 : 0;
    }

    getTotalQuestions() {
        return this.currentQuestion ? this.currentQuestion.total_questions : 0;
    }

    isQuestionAnswered(questionIndex) {
        return this.isAnswered;
    }

    previousQuestion() {
        console.log('⬅️ Previous question requested');
        // TODO: Implement previous question logic
    }

    nextQuestion() {
        console.log('➡️ Next question requested');
        this.loadCurrentQuestion();
    }

    skipQuestion() {
        console.log('⏭️ Question skipped');
        this.loadCurrentQuestion();
    }

    endQuiz() {
        console.log('🏁 Quiz ended');
        // TODO: Implement quiz end logic
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM loaded, initializing QuizApp...');
    new QuizApp();
});

export { QuizApp }; 