/**
 * Quiz Settings Manager
 * Handles all quiz settings and form interactions
 */

export class QuizSettingsManager {
    constructor() {
        this.settings = {
            class: null,
            subject: null,
            topic: null,
            difficulty: null,
            timer: 'disabled',
            timerMinutes: 2,
            quizMode: 'practice'
        };
        
        this.callbacks = [];
    }
    
    init() {
        this.setupEventListeners();
        this.loadDefaultSettings();
    }
    
    setupEventListeners() {
        // Class selection
        document.querySelectorAll('input[name="class"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.class = e.target.value;
                this.notifySettingsChanged();
            });
        });
        
        // Subject selection
        document.querySelectorAll('input[name="subject"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.subject = e.target.value;
                this.notifySettingsChanged();
            });
        });
        
        // Topic selection
        document.querySelectorAll('input[name="topic"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.topic = e.target.value;
                this.notifySettingsChanged();
            });
        });
        
        // Difficulty selection
        document.querySelectorAll('input[name="difficulty"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.difficulty = e.target.value;
                this.notifySettingsChanged();
            });
        });
        
        // Timer selection
        document.querySelectorAll('input[name="timer"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.timer = e.target.value;
                this.notifySettingsChanged();
            });
        });
        
        // Timer minutes input
        const timerMinutesInput = document.getElementById('timer-minutes');
        if (timerMinutesInput) {
            timerMinutesInput.addEventListener('change', (e) => {
                this.settings.timerMinutes = parseInt(e.target.value) || 2;
                this.notifySettingsChanged();
            });
        }
        
        // Quiz mode selection
        document.querySelectorAll('input[name="quiz-mode"]').forEach(input => {
            input.addEventListener('change', (e) => {
                this.settings.quizMode = e.target.value;
                this.notifySettingsChanged();
            });
        });
    }
    
    loadDefaultSettings() {
        // Set default values
        const defaultTimer = document.getElementById('timer-disabled');
        if (defaultTimer) {
            defaultTimer.checked = true;
        }
        
        const defaultMode = document.getElementById('quiz-mode-practice');
        if (defaultMode) {
            defaultMode.checked = true;
        }
    }
    
    getSettings() {
        return { ...this.settings };
    }
    
    updateSetting(key, value) {
        this.settings[key] = value;
        this.notifySettingsChanged();
    }
    
    onSettingsChanged(callback) {
        this.callbacks.push(callback);
    }
    
    notifySettingsChanged() {
        this.callbacks.forEach(callback => callback(this.settings));
    }
    
    reset() {
        // Reset form
        const form = document.getElementById('quiz-settings-form');
        if (form) {
            form.reset();
        }
        
        // Reset settings object
        this.settings = {
            class: null,
            subject: null,
            topic: null,
            difficulty: null,
            timer: 'disabled',
            timerMinutes: 2,
            quizMode: 'practice'
        };
        
        // Set default values
        this.loadDefaultSettings();
        
        // Notify listeners
        this.notifySettingsChanged();
    }
    
    // Helper methods for specific settings
    getClass() {
        return this.settings.class;
    }
    
    getSubject() {
        return this.settings.subject;
    }
    
    getTopic() {
        return this.settings.topic;
    }
    
    getDifficulty() {
        return this.settings.difficulty;
    }
    
    getTimer() {
        return this.settings.timer;
    }
    
    getTimerMinutes() {
        return this.settings.timerMinutes;
    }
    
    getQuizMode() {
        return this.settings.quizMode;
    }
} 