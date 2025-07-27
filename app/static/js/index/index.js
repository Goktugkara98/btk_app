/**
 * INDEX PAGE - MAIN JAVASCRIPT FILE
 * Sadece import'ları içerir
 * =============================================================================
 */

// Import Sections
import { initHeroQuiz } from './sections/hero.js';

// Initialize all sections
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Hero Section
    initHeroQuiz();
});

// Import Components (eğer gelecekte ortak JS component'leri olursa)
// import '../components/shared.js'; 