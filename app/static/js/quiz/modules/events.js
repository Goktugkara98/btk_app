// =============================================================================
// Quiz Event Handler Module
// =============================================================================

export class QuizEventHandler {
    constructor(state, uiManager, apiService) {
        this.state = state;
        this.uiManager = uiManager;
        this.apiService = apiService;
        // Remove bindEvents() call from constructor
        // bindEvents() will be called by the controller after initialization
    }

    bindEvents() {
        console.log('🔗 Binding events...');
        
        // Option selection events
        this.uiManager.elements.optionsContainer?.addEventListener('click', (e) => {
            const optionElement = e.target.closest('.option-item');
            if (optionElement) {
                const optionIndex = parseInt(optionElement.dataset.option);
                this.handleOptionSelection(optionIndex);
            }
        });

        // Navigation events
        this.uiManager.elements.prevButton?.addEventListener('click', () => {
            this.handlePreviousQuestion();
        });

        this.uiManager.elements.nextButton?.addEventListener('click', () => {
            this.handleNextQuestion();
        });

        // Button events
        this.uiManager.elements.retryButton?.addEventListener('click', () => {
            this.handleRetry();
        });
    }

    handleOptionSelection(optionIndex) {
        console.log(`🎯 Option selected: ${optionIndex}`);
        
        if (this.state.isQuestionAnswered() || this.state.isQuizCompleted()) {
            console.log('⚠️ Question already answered or quiz completed');
            return;
        }

        this.selectAnswer(optionIndex);
    }

    async selectAnswer(optionIndex) {
        try {
            const currentQuestion = this.state.getCurrentQuestion();
            if (!currentQuestion) return;

            // Update state
            this.state.setCurrentAnswer(optionIndex);
            this.state.setAnswered(true);
            this.state.storeAnswer(currentQuestion.question.id, optionIndex);

            // Update UI
            this.uiManager.updateAnswerUI(optionIndex);
            this.uiManager.updateNavigation(currentQuestion);

            // Check if this is the last question
            if (currentQuestion.question_number >= currentQuestion.total_questions) {
                await this.completeQuiz();
            } else {
                // Auto-advance after delay
                setTimeout(() => {
                    this.handleNextQuestion();
                }, 1000);
            }

        } catch (error) {
            console.error('❌ Error selecting answer:', error);
            this.uiManager.displayError('Cevap seçilirken hata oluştu: ' + error.message);
        }
    }

    handlePreviousQuestion() {
        if (this.state.previousQuestion()) {
            this.loadCurrentQuestion();
        }
    }

    handleNextQuestion() {
        if (this.state.nextQuestion()) {
            this.loadCurrentQuestion();
        } else {
            this.completeQuiz();
        }
    }

    async loadCurrentQuestion() {
        try {
            const questions = this.state.allQuestions;
            const currentIndex = this.state.getCurrentQuestionIndex();
            
            if (currentIndex >= questions.length) {
                await this.completeQuiz();
                return;
            }

            const questionData = questions[currentIndex];
            this.state.setCurrentQuestion(questionData);
            this.state.setAnswered(false);
            this.state.setCurrentAnswer(null);

            // Check if already answered
            if (this.state.hasStoredAnswer(questionData.question.id)) {
                this.state.setCurrentAnswer(this.state.getStoredAnswer(questionData.question.id));
                this.state.setAnswered(true);
            }

            // Update UI
            this.uiManager.displayQuestion(questionData);
            // updateNavigation is called within displayQuestion, so we don't need to call it again
            this.uiManager.updateProgress(this.state.getProgressPercentage());

        } catch (error) {
            console.error('❌ Error loading question:', error);
            this.uiManager.displayError('Soru yüklenirken hata oluştu: ' + error.message);
        }
    }

    async completeQuiz() {
        try {
            console.log('🏁 Completing quiz...');
            const results = await this.apiService.completeQuiz();
            this.state.setQuizCompleted(true);
            this.uiManager.displayResults(results);
        } catch (error) {
            console.error('❌ Error completing quiz:', error);
            this.uiManager.displayError('Quiz tamamlanırken hata oluştu: ' + error.message);
        }
    }

    handleRetry() {
        console.log('🔄 Retrying...');
        window.location.reload();
    }

    handleViewResults() {
        console.log('📊 Viewing results...');
        window.location.href = `/quiz/results/${this.state.getSessionId()}`;
    }

    handleNewQuiz() {
        console.log('🆕 Starting new quiz...');
        window.location.href = '/quiz/auto-start';
    }
} 