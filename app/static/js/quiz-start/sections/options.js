// Quiz Options Manager - Clean slate

class QuizOptionsManager {
    constructor() {
        this.init();
    }

    init() {
        console.log('Quiz Options Manager initialized');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const quizOptionsManager = new QuizOptionsManager();
    window.quizOptionsManager = quizOptionsManager;
}); 