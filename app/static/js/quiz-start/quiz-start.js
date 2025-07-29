// Quiz Start Page - Main JavaScript

class QuizStartPage {
    constructor() {
        this.init();
    }

    init() {
        console.log('Quiz Start Page initialized');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const quizStartPage = new QuizStartPage();
    window.quizStartPage = quizStartPage;
}); 