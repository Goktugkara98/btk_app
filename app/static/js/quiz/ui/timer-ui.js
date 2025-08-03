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
        this.duration = null;
        this.isRunning = false;
        
        this.init();
    }

    init() {
        this.timerElement = document.querySelector('.timer-text');
        if (!this.timerElement) {
            console.error('❌ Timer element not found');
            return;
        }
        
        console.log('⏰ Timer initialized');
    }

    setTimer(duration) {
        this.duration = duration;
        this.startTime = Date.now();
        console.log(`⏰ Timer set to ${duration} seconds`);
    }

    start() {
        if (this.isRunning) {
            return;
        }
        
        this.isRunning = true;
        this.startTime = Date.now();
        this.updateDisplay();
        this.startTimer();
        console.log('⏰ Timer started');
    }

    hide() {
        if (this.timerElement) {
            this.timerElement.style.display = 'none';
        }
        this.stopTimer();
        console.log('⏰ Timer hidden');
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.updateDisplay();
        }, 1000);
    }

    updateDisplay() {
        if (this.timerElement && this.startTime) {
            if (this.duration) {
                // Countdown timer
                const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
                const remainingSeconds = Math.max(0, this.duration - elapsedSeconds);
                
                if (remainingSeconds <= 0) {
                    this.stopTimer();
                    this.eventBus.emit('timer:expired');
                    return;
                }
                
                const minutes = Math.floor(remainingSeconds / 60);
                const seconds = remainingSeconds % 60;
                this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                // Elapsed time timer
                const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
                const minutes = Math.floor(elapsedSeconds / 60);
                const seconds = elapsedSeconds % 60;
                this.timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }
    }

    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        this.isRunning = false;
        console.log('⏰ Timer stopped');
    }
} 