/**
 * =============================================================================
 * QUIZ APP - MAIN ENTRY POINT
 * =============================================================================
 * 
 * Bu dosya quiz uygulamasının ana giriş noktasıdır.
 * Tüm modülleri import eder ve uygulamayı başlatır.
 * 
 * Sorumlulukları:
 * - Tüm modülleri import etmek
 * - Quiz uygulamasını başlatmak
 * - Global event listener'ları kurmak
 * - Error handling sağlamak
 */

// Core modules
import { QuizCore } from './core/quiz-core.js';
import { QuizState } from './core/quiz-state.js';

// UI modules
import { QuizUI } from './ui/quiz-ui.js';
import { TimerUI } from './ui/timer-ui.js';
import { NavigationUI } from './ui/navigation-ui.js';
import { QuestionNavigationUI } from './ui/question-navigation-ui.js';

// Data modules
import { QuizDataManager } from './data/quiz-data-manager.js';

// Utils modules
import { QuizUtils } from './utils/quiz-utils.js';
import { EventBus } from './utils/event-bus.js';

// Main Quiz App Class
class QuizApp {
    constructor() {
        this.core = null;
        this.ui = null;
        this.dataManager = null;
        this.eventBus = null;
        this.questionNavigationUI = null;
    }

    async init() {
        try {
            // Initialize event bus first
            this.eventBus = new EventBus();
            
            // Initialize data manager
            this.dataManager = new QuizDataManager();
            await this.dataManager.loadQuizData();
            
            // Initialize core
            this.core = new QuizCore(this.dataManager, this.eventBus);
            
            // Initialize UI components
            this.ui = new QuizUI(this.core, this.eventBus);
            this.timerUI = new TimerUI(this.core, this.eventBus);
            this.navigationUI = new NavigationUI(this.core, this.eventBus);
            this.questionNavigationUI = new QuestionNavigationUI(this.core, this.eventBus);
            
            // Start the quiz
            this.core.startQuiz();
            
        } catch (error) {
            console.error('Quiz initialization failed:', error);
            // Show error UI
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const quizApp = new QuizApp();
    quizApp.init();
});

export { QuizApp }; 