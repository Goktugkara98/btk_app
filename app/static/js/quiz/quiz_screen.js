// =============================================================================
// Quiz Screen - Main Entry Point
// =============================================================================

import { QuizController } from './modules/controller.js';

// =============================================================================
// INITIALIZATION
// =============================================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎯 DOM loaded, initializing Quiz Controller...');
    const quizController = new QuizController();
    quizController.initialize();
}); 