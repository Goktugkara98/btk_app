/**
 * =============================================================================
 * QUESTION NAVIGATION UI - QUESTION NAVIGATION COMPONENT
 * =============================================================================
 * 
 * Bu dosya soru navigasyonu için UI bileşenini içerir.
 * Soru kutucuklarını yönetir ve kullanıcının istediği soruya geçmesini sağlar.
 * 
 * Sorumlulukları:
 * - Soru navigasyon kutucuklarını oluşturmak
 * - Mevcut soruyu göstermek
 * - Cevaplanmış soruları işaretlemek
 * - Soru geçişlerini yönetmek
 * - Responsive tasarımı desteklemek
 */

export class QuestionNavigationUI {
    constructor(quizCore, eventBus) {
        this.quizCore = quizCore;
        this.eventBus = eventBus;
        this.navigationContainer = null;
        this.navigationItems = [];
        this.currentQuestionIndex = 0;
        
        this.init();
    }

    init() {
        this.createNavigationContainer();
        this.bindEvents();
        this.renderNavigation();
    }

    createNavigationContainer() {
        // Check if navigation already exists
        let navigation = document.querySelector('.question-navigation');
        
        if (!navigation) {
            // Create navigation container
            navigation = document.createElement('div');
            navigation.className = 'question-navigation';
            
            const container = document.createElement('div');
            container.className = 'question-navigation-container';
            
            const scrollContainer = document.createElement('div');
            scrollContainer.className = 'question-navigation-scroll';
            
            container.appendChild(scrollContainer);
            navigation.appendChild(container);
            
            // Insert after navbar and before quiz-main
            const quizMain = document.querySelector('.quiz-main');
            if (quizMain) {
                quizMain.parentNode.insertBefore(navigation, quizMain);
            }
        }
        
        this.navigationContainer = navigation.querySelector('.question-navigation-scroll');
    }

    bindEvents() {
        // Listen for quiz state changes
        this.eventBus.on('questionChanged', (data) => {
            this.updateCurrentQuestion(data.questionIndex);
        });

        this.eventBus.on('answerSubmitted', (data) => {
            this.updateAnsweredQuestion(data.questionIndex);
        });

        this.eventBus.on('quizStarted', (data) => {
            this.renderNavigation();
        });

        this.eventBus.on('quizReset', () => {
            this.resetNavigation();
        });
    }

    renderNavigation() {
        if (!this.navigationContainer) return;

        // Clear existing items
        this.navigationContainer.innerHTML = '';
        this.navigationItems = [];

        const totalQuestions = this.quizCore.getTotalQuestions();
        
        for (let i = 0; i < totalQuestions; i++) {
            const navItem = this.createNavigationItem(i);
            this.navigationItems.push(navItem);
            this.navigationContainer.appendChild(navItem);
        }

        // Update current question
        this.updateCurrentQuestion(this.quizCore.getCurrentQuestionIndex());
        
        // Update answered questions
        this.updateAnsweredQuestions();
    }

    createNavigationItem(questionIndex) {
        const item = document.createElement('div');
        item.className = 'question-nav-item';
        item.textContent = questionIndex + 1;
        item.dataset.questionIndex = questionIndex;
        
        // Add click event
        item.addEventListener('click', () => {
            this.navigateToQuestion(questionIndex);
        });

        return item;
    }

    navigateToQuestion(questionIndex) {
        // Allow navigation to any question
        // Users can go back to previous questions or jump to any answered question
        if (questionIndex >= 0 && questionIndex < this.quizCore.getTotalQuestions()) {
            this.quizCore.goToQuestion(questionIndex);
        }
    }

    updateCurrentQuestion(questionIndex) {
        // Remove current class from all items
        this.navigationItems.forEach(item => {
            item.classList.remove('current');
        });

        // Add current class to new item
        if (this.navigationItems[questionIndex]) {
            this.navigationItems[questionIndex].classList.add('current');
            
            // Scroll to current item
            this.scrollToItem(questionIndex);
        }

        this.currentQuestionIndex = questionIndex;
    }

    updateAnsweredQuestion(questionIndex) {
        if (this.navigationItems[questionIndex]) {
            this.navigationItems[questionIndex].classList.add('answered');
        }
    }

    updateAnsweredQuestions() {
        const totalQuestions = this.quizCore.getTotalQuestions();
        
        for (let i = 0; i < totalQuestions; i++) {
            if (this.quizCore.isQuestionAnswered(i)) {
                this.updateAnsweredQuestion(i);
            }
        }
    }

    scrollToItem(questionIndex) {
        if (!this.navigationItems[questionIndex]) return;

        const item = this.navigationItems[questionIndex];
        const container = this.navigationContainer;
        
        // Calculate scroll position
        const itemLeft = item.offsetLeft;
        const containerWidth = container.offsetWidth;
        const itemWidth = item.offsetWidth;
        
        // Center the item in the container
        const scrollLeft = itemLeft - (containerWidth / 2) + (itemWidth / 2);
        
        // Smooth scroll
        container.scrollTo({
            left: Math.max(0, scrollLeft),
            behavior: 'smooth'
        });
    }

    resetNavigation() {
        // Remove all classes
        this.navigationItems.forEach(item => {
            item.classList.remove('current', 'answered');
        });

        // Reset to first question
        this.updateCurrentQuestion(0);
    }

    // Public methods for external access
    getCurrentQuestionIndex() {
        return this.currentQuestionIndex;
    }

    getNavigationItems() {
        return this.navigationItems;
    }

    // Cleanup method
    destroy() {
        // Remove event listeners
        this.eventBus.off('questionChanged');
        this.eventBus.off('answerSubmitted');
        this.eventBus.off('quizStarted');
        this.eventBus.off('quizReset');
        
        // Remove navigation container
        if (this.navigationContainer) {
            const navigation = this.navigationContainer.closest('.question-navigation');
            if (navigation && navigation.parentNode) {
                navigation.parentNode.removeChild(navigation);
            }
        }
    }
} 