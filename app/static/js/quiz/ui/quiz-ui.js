/**
 * =============================================================================
 * QUIZ UI - MAIN QUIZ INTERFACE
 * =============================================================================
 * 
 * Bu dosya quiz'in ana UI bileşenlerini yönetir.
 * Soru gösterimi, cevap seçimi ve genel UI güncellemelerini kontrol eder.
 * 
 * Sorumlulukları:
 * - Soru metnini göstermek
 * - Cevap seçeneklerini göstermek
 * - Cevap seçimi UI'ını yönetmek
 * - UI güncellemelerini yapmak
 * - Event listener'ları kurmak
 */

export class QuizUI {
    constructor(core, eventBus) {
        this.core = core;
        this.eventBus = eventBus;
        this.elements = {
            questionContainer: null,
            questionText: null,
            optionsContainer: null,
            options: []
        };
        
        this.init();
        this.bindEvents();
    }

    init() {
        this.elements.questionContainer = document.querySelector('.question-container');
        this.elements.questionText = document.querySelector('.question-text');
        this.elements.optionsContainer = document.querySelector('.options-container');
        
        if (!this.elements.questionContainer) {
            console.error('❌ Quiz container not found');
            return;
        }
        
        console.log('✅ Quiz UI initialized');
    }

    bindEvents() {
        // Listen for question loaded events
        this.eventBus.on('question:loaded', (data) => {
            console.log('📝 Loading question:', data.index + 1);
            this.displayQuestion(data.question, data.index);
        });

        // Listen for answer selected events
        this.eventBus.on('answer:selected', (data) => {
            console.log('✅ Answer selected:', data.answerIndex);
            this.updateAnswerUI(data.questionIndex, data.answerIndex);
        });

        // Listen for quiz completion
        this.eventBus.on('quiz:completed', (results) => {
            console.log('🏁 Quiz completed:', results);
            this.showResults(results);
        });

        // Listen for timer expired
        this.eventBus.on('timer:expired', () => {
            this.handleTimerExpired();
        });
    }

    displayQuestion(questionData, index) {
        if (!this.elements.questionText || !this.elements.optionsContainer) {
            console.error('❌ Question elements not found');
            return;
        }

        // Debug: Log the question object
        console.log('📋 Question object:', JSON.stringify(questionData, null, 2));

        // Safety check for question structure
        if (!questionData || !questionData.question || !questionData.question.text) {
            console.error('❌ Invalid question structure:', questionData);
            return;
        }

        // Update question text
        this.elements.questionText.textContent = questionData.question.text;
        console.log(`📝 Question ${questionData.question_number || 1}: ${questionData.question.text}`);

        // Clear previous options
        this.elements.optionsContainer.innerHTML = '';
        this.elements.options = [];

        // Safety check for options
        if (!questionData.question.options || !Array.isArray(questionData.question.options)) {
            console.error('❌ Invalid options structure:', questionData.question.options);
            return;
        }

        // Create option elements
        questionData.question.options.forEach((option, optionIndex) => {
            const optionElement = this.createOptionElement(option.option_text, optionIndex, questionData.question_number - 1);
            this.elements.optionsContainer.appendChild(optionElement);
            this.elements.options.push(optionElement);
        });

        // Show current answer if exists
        const currentAnswer = this.core.getCurrentAnswer();
        if (currentAnswer !== undefined && currentAnswer !== null) {
            this.updateAnswerUI(questionData.question_number - 1, currentAnswer);
        }

        console.log(`📋 Created ${questionData.question.options.length} options`);
    }

    createOptionElement(option, optionIndex, questionIndex) {
        const optionElement = document.createElement('div');
        optionElement.className = 'option';
        optionElement.dataset.optionIndex = optionIndex;
        optionElement.dataset.questionIndex = questionIndex;
        
        optionElement.innerHTML = `
            <div class="option-content">
                <span class="option-letter">${String.fromCharCode(65 + optionIndex)}</span>
                <span class="option-text">${option}</span>
            </div>
        `;

        // Add click event
        optionElement.addEventListener('click', () => {
            this.selectOption(optionIndex);
        });

        return optionElement;
    }

    selectOption(optionIndex) {
        console.log(`🎯 User selected option: ${optionIndex}`);
        
        // Check if this option is already selected
        const currentAnswer = this.core.getCurrentAnswer();
        if (currentAnswer === optionIndex) {
            console.log('🔄 Same option selected, no action needed');
            return;
        }
        
        this.core.selectAnswer(optionIndex);
    }

    updateAnswerUI(questionIndex, answerIndex) {
        // Remove previous selections
        this.elements.options.forEach(option => {
            option.classList.remove('selected', 'correct', 'incorrect');
        });

        // Mark selected answer
        if (this.elements.options[answerIndex] !== undefined) {
            this.elements.options[answerIndex].classList.add('selected');
            console.log(`✅ Marked option ${answerIndex} as selected`);
        }
    }

    handleTimerExpired() {
        // Show visual feedback for timer expiration
        this.elements.options.forEach(option => {
            option.style.opacity = '0.6';
        });
        
        console.log('⏰ Timer expired - showing visual feedback');
    }

    showResults(results) {
        // Create results display
        const resultsHTML = `
            <div class="quiz-results">
                <h2>Quiz Tamamlandı!</h2>
                <div class="results-summary">
                    <div class="score-circle">
                        <span class="score-number">${results.score}%</span>
                        <span class="score-label">Başarı</span>
                    </div>
                    <div class="results-details">
                        <p><strong>Doğru Cevap:</strong> ${results.correctAnswers}/${results.totalQuestions}</p>
                        <p><strong>Yanlış Cevap:</strong> ${results.totalQuestions - results.correctAnswers}</p>
                    </div>
                </div>
                <div class="results-actions">
                    <button class="btn-primary" onclick="location.reload()">Tekrar Dene</button>
                    <button class="btn-secondary" onclick="window.location.href='/'">Ana Sayfa</button>
                </div>
            </div>
        `;
        
        this.elements.questionContainer.innerHTML = resultsHTML;
        console.log('🏆 Results displayed');
    }

    showLoading() {
        if (this.elements.questionContainer) {
            this.elements.questionContainer.innerHTML = `
                <div class="loading">
                    <div class="loading-spinner"></div>
                    <p>Soru yükleniyor...</p>
                </div>
            `;
            console.log('⏳ Loading state displayed');
        }
    }

    showError(message) {
        if (this.elements.questionContainer) {
            this.elements.questionContainer.innerHTML = `
                <div class="error">
                    <i class="bi bi-exclamation-triangle"></i>
                    <p>${message}</p>
                    <button onclick="location.reload()">Tekrar Dene</button>
                </div>
            `;
            console.error('❌ Error displayed:', message);
        }
    }

    // Utility methods
    highlightCorrectAnswer(correctIndex) {
        if (this.elements.options[correctIndex]) {
            this.elements.options[correctIndex].classList.add('correct');
        }
    }

    highlightIncorrectAnswer(selectedIndex, correctIndex) {
        if (this.elements.options[selectedIndex]) {
            this.elements.options[selectedIndex].classList.add('incorrect');
        }
        if (this.elements.options[correctIndex]) {
            this.elements.options[correctIndex].classList.add('correct');
        }
    }

    disableOptions() {
        this.elements.options.forEach(option => {
            option.style.pointerEvents = 'none';
        });
    }

    enableOptions() {
        this.elements.options.forEach(option => {
            option.style.pointerEvents = 'auto';
        });
    }
} 