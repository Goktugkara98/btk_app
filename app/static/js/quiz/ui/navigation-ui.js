/**
 * =============================================================================
 * NAVIGATION UI - NAVIGATION CONTROLS
 * =============================================================================
 * 
 * Bu dosya quiz navigasyonunu yönetir.
 * Önceki/sonraki butonları, ilerleme gösterimi ve navigasyon event'lerini kontrol eder.
 * 
 * Sorumlulukları:
 * - Navigasyon butonlarını yönetmek
 * - İlerleme gösterimini güncellemek
 * - Buton durumlarını kontrol etmek
 * - Navigasyon event'lerini tetiklemek
 */

export class NavigationUI {
    constructor(core, eventBus) {
        this.core = core;
        this.eventBus = eventBus;
        this.elements = {
            prevButton: null,
            nextButton: null,
            progressText: null,
            categoryText: null
        };
        
        this.init();
        this.bindEvents();
    }

    init() {
        this.elements.prevButton = document.querySelector('.prev-btn');
        this.elements.nextButton = document.querySelector('.next-btn');
        this.elements.progressText = document.querySelector('.progress-text');
        this.elements.categoryText = document.querySelector('.category-text');
        
        if (!this.elements.prevButton || !this.elements.nextButton) {
            console.error('Navigation buttons not found');
            return;
        }
    }

    bindEvents() {
        // Button click events
        this.elements.prevButton.addEventListener('click', () => {
            this.previousQuestion();
        });

        this.elements.nextButton.addEventListener('click', () => {
            this.nextQuestion();
        });

        // Listen for question loaded events
        this.eventBus.on('question:loaded', (data) => {
            this.updateNavigation(data.index);
        });

        // Listen for answer selected events
        this.eventBus.on('answer:selected', () => {
            this.enableNextButton();
        });

        // Listen for question skipped events
        this.eventBus.on('questionSkipped', () => {
            this.enableNextButton();
        });

        // Listen for quiz completion
        this.eventBus.on('quiz:completed', () => {
            this.showFinishButton();
        });
    }

    updateNavigation(questionIndex) {
        const totalQuestions = this.core.getTotalQuestions();
        
        // Update progress text
        if (this.elements.progressText) {
            this.elements.progressText.innerHTML = `Soru <span class="current">${questionIndex + 1}</span>/<span class="total">${totalQuestions}</span>`;
        }

        // Update button states
        this.elements.prevButton.disabled = questionIndex === 0;
        
        // Enable next button if question is answered or we can skip
        const isAnswered = this.core.isQuestionAnswered(questionIndex);
        this.elements.nextButton.disabled = false; // Always enabled for skip functionality

        // Update button text for last question
        if (questionIndex === totalQuestions - 1) {
            this.elements.nextButton.innerHTML = '<span>Bitir</span><i class="bi bi-check"></i>';
            this.elements.nextButton.classList.add('finish');
        } else {
            this.elements.nextButton.innerHTML = '<span>Sonraki</span><i class="bi bi-chevron-right"></i>';
            this.elements.nextButton.classList.remove('finish');
        }
    }

    enableNextButton() {
        if (this.elements.nextButton) {
            this.elements.nextButton.disabled = false;
        }
    }

    disableNextButton() {
        if (this.elements.nextButton) {
            this.elements.nextButton.disabled = true;
        }
    }

    disableNavigation() {
        if (this.elements.prevButton) {
            this.elements.prevButton.disabled = true;
        }
        if (this.elements.nextButton) {
            this.elements.nextButton.disabled = true;
        }
        console.log('🚫 Navigation disabled');
    }

    enableNavigation() {
        if (this.elements.prevButton) {
            this.elements.prevButton.disabled = false;
        }
        if (this.elements.nextButton) {
            this.elements.nextButton.disabled = false;
        }
        console.log('✅ Navigation enabled');
    }

    previousQuestion() {
        this.core.previousQuestion();
    }

    nextQuestion() {
        const currentIndex = this.core.getCurrentIndex();
        const totalQuestions = this.core.getTotalQuestions();
        
        if (currentIndex === totalQuestions - 1) {
            // Finish quiz
            this.core.endQuiz();
        } else {
            // Skip current question and go to next
            this.core.skipQuestion();
        }
    }

    showFinishButton() {
        if (this.elements.nextButton) {
            this.elements.nextButton.innerHTML = '<span>Sonuçları Gör</span><i class="bi bi-arrow-right"></i>';
            this.elements.nextButton.disabled = false;
        }
    }

    updateCategory(category) {
        if (this.elements.categoryText) {
            this.elements.categoryText.textContent = category;
        }
    }
} 