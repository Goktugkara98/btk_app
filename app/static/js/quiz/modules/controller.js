// =============================================================================
// Quiz Controller Module
// =============================================================================

import { QuizState } from './state.js';
import { QuizApiService } from './api.js';
import { QuizUIManager } from './ui.js';
import { QuizEventHandler } from './events.js';

export class QuizController {
    constructor() {
        this.state = new QuizState();
        this.apiService = new QuizApiService(this.state);
        this.uiManager = new QuizUIManager(this.state);
        this.eventHandler = new QuizEventHandler(this.state, this.uiManager, this.apiService);
        this.timerInterval = null;
        this.remainingTime = 0;
    }

    async initialize() {
        console.log('🚀 Quiz Controller initializing...');
        
        try {
            // Initialize UI elements
            this.uiManager.initializeElements();
            
            // Load all questions
            const apiResponse = await this.apiService.fetchAllQuestions();
            console.log('📄 Raw API Response:', apiResponse);
            
            // Check if we have questions array
            let questions = [];
            if (apiResponse && Array.isArray(apiResponse)) {
                questions = apiResponse;
            } else if (apiResponse && apiResponse.questions && Array.isArray(apiResponse.questions)) {
                questions = apiResponse.questions;
            } else if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data)) {
                questions = apiResponse.data;
            } else {
                throw new Error('Invalid API response structure. Expected questions array.');
            }
            
            this.state.setAllQuestions(questions);
            console.log('✅ Loaded', questions.length, 'questions');
            
            // Get session status for timer only
            try {
                const sessionStatus = await this.apiService.getSessionStatus();
                console.log('📊 Session Status:', sessionStatus);
                
                // Update UI with session information (timer only)
                if (sessionStatus) {
                    console.log('🔍 Session data for timer:', {
                        remaining_time: sessionStatus.remaining_time_seconds,
                        timer_enabled: sessionStatus.timer_enabled
                    });
                    
                    // Only start timer if timer is enabled and there's remaining time
                    if (sessionStatus.timer_enabled && sessionStatus.remaining_time_seconds > 0) {
                        console.log('⏰ Starting timer with:', sessionStatus.remaining_time_seconds, 'seconds');
                        this.remainingTime = sessionStatus.remaining_time_seconds;
                        this.uiManager.updateTimer(this.remainingTime);
                        this.startTimer();
                    } else if (sessionStatus.timer_enabled && sessionStatus.remaining_time_seconds === 0) {
                        console.log('⏰ Timer enabled but no time remaining, setting to 0:00');
                        this.uiManager.updateTimer(0);
                    } else {
                        console.log('⏰ Timer disabled or no timer data');
                        // Set a default display for disabled timer
                        this.uiManager.updateTimer(null);
                    }
                } else {
                    console.warn('⚠️ No session status data received');
                }
            } catch (error) {
                console.warn('⚠️ Could not fetch session status:', error);
            }
            
            // Create question navigation
            this.uiManager.createQuestionNavigation(questions.length);
            
            // Bind events
            this.bindEvents();
            
            // Load current question
            await this.eventHandler.loadCurrentQuestion();
            this.uiManager.showQuestion();
            
            // Update question navigation
            this.uiManager.updateQuestionNavigation(1, []);
            
            console.log('✅ Quiz Controller initialized successfully');
            
        } catch (error) {
            console.error('❌ Error initializing Quiz Controller:', error);
            this.uiManager.showError('Quiz yüklenirken bir hata oluştu: ' + error.message);
        }
    }

    bindEvents() {
        // Bind existing events
        this.eventHandler.bindEvents();
        
        // Bind question navigation events
        document.addEventListener('questionNavClick', (event) => {
            const { questionNumber } = event.detail;
            this.handleQuestionNavigation(questionNumber);
        });
    }

    handleQuestionNavigation(questionNumber) {
        console.log('🎯 Handling question navigation to question:', questionNumber);
        
        // Check if the question number is valid
        if (questionNumber < 1 || questionNumber > this.state.getAllQuestions().length) {
            console.warn('⚠️ Invalid question number:', questionNumber);
            return;
        }
        
        // Set the current question
        this.state.setCurrentQuestionNumber(questionNumber);
        
        // Load and display the question
        this.eventHandler.loadCurrentQuestion();
        
        // Update UI
        this.uiManager.showQuestion();
    }

    startTimer() {
        // Clear existing timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        // Only start countdown if there's actual time remaining
        if (this.remainingTime <= 0) {
            console.log('⏰ No time remaining, not starting timer');
            return;
        }
        
        console.log('⏰ Starting countdown timer with', this.remainingTime, 'seconds');
        
        // Start countdown timer
        this.timerInterval = setInterval(() => {
            this.remainingTime--;
            
            if (this.remainingTime <= 0) {
                // Time's up!
                clearInterval(this.timerInterval);
                this.uiManager.updateTimer(0);
                this.handleTimeUp();
            } else {
                this.uiManager.updateTimer(this.remainingTime);
            }
        }, 1000);
    }

    handleTimeUp() {
        console.log('⏰ Time is up! Auto-completing quiz...');
        // Auto-complete the quiz when time runs out
        this.eventHandler.completeQuiz();
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
} 