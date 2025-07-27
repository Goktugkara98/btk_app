/**
 * =============================================================================
 * TIMER UI - SIMPLE TIMER
 * =============================================================================
 * 
 * Bu dosya quiz timer'ını yönetir.
 * Sadece geçen zamanı gösterir.
 */

export class TimerUI {
    constructor(core, eventBus) {
        this.core = core;
        this.eventBus = eventBus;
        this.timerElement = null;
        this.timerInterval = null;
        this.startTime = null;
        
        this.init();
    }

    init() {
        this.timerElement = document.querySelector('.timer-text');
        if (!this.timerElement) {
            console.error('❌ Timer element not found');
            return;
        }
        
        this.startTime = Date.now();
        this.updateDisplay();
        this.startTimer();
        
        console.log('⏰ Timer initialized');
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.updateDisplay();
        }, 1000);
    }

    updateDisplay() {
        if (this.timerElement && this.startTime) {
            const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsedSeconds / 60);
            const seconds = elapsedSeconds % 60;
            this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
} 