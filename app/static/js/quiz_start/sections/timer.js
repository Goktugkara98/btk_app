/**
 * Timer Manager
 * Handles timer settings and duration input
 */

export class TimerManager {
    constructor() {
        this.timerDurationContainer = document.getElementById('timer-duration');
        this.timerMinutesInput = document.getElementById('timer-minutes');
        this.timerEnabledRadio = document.getElementById('timer-enabled');
        this.timerDisabledRadio = document.getElementById('timer-disabled');
        this.callbacks = [];
    }
    
    init() {
        this.setupEventListeners();
        this.updateTimerVisibility();
    }
    
    setupEventListeners() {
        // Timer toggle event listeners
        if (this.timerEnabledRadio) {
            this.timerEnabledRadio.addEventListener('change', () => {
                this.updateTimerVisibility();
                this.notifySettingsChanged();
            });
        }
        
        if (this.timerDisabledRadio) {
            this.timerDisabledRadio.addEventListener('change', () => {
                this.updateTimerVisibility();
                this.notifySettingsChanged();
            });
        }
        
        // Timer minutes input validation
        if (this.timerMinutesInput) {
            this.timerMinutesInput.addEventListener('input', (e) => {
                this.validateTimerInput(e.target);
                this.notifySettingsChanged();
            });
            
            this.timerMinutesInput.addEventListener('blur', (e) => {
                this.formatTimerInput(e.target);
                this.notifySettingsChanged();
            });
        }
    }
    
    updateTimerVisibility() {
        if (!this.timerDurationContainer) return;
        
        const isTimerEnabled = this.timerEnabledRadio && this.timerEnabledRadio.checked;
        
        if (isTimerEnabled) {
            this.timerDurationContainer.style.display = 'block';
            this.timerDurationContainer.classList.add('show');
            
            // Focus on input when timer is enabled
            if (this.timerMinutesInput) {
                setTimeout(() => {
                    this.timerMinutesInput.focus();
                }, 100);
            }
        } else {
            this.timerDurationContainer.style.display = 'none';
            this.timerDurationContainer.classList.remove('show');
        }
    }
    
    validateTimerInput(input) {
        let value = parseInt(input.value);
        
        // Ensure value is within valid range
        if (isNaN(value) || value < 1) {
            value = 1;
        } else if (value > 60) {
            value = 60;
        }
        
        input.value = value;
    }
    
    formatTimerInput(input) {
        let value = parseInt(input.value);
        
        if (isNaN(value) || value < 1) {
            value = 2; // Default value
        }
        
        input.value = value;
    }
    
    getTimerSettings() {
        const isEnabled = this.timerEnabledRadio && this.timerEnabledRadio.checked;
        const minutes = this.timerMinutesInput ? parseInt(this.timerMinutesInput.value) : 2;
        
        return {
            enabled: isEnabled,
            minutes: minutes,
            seconds: minutes * 60
        };
    }
    
    setTimerSettings(enabled, minutes = 2) {
        if (enabled) {
            if (this.timerEnabledRadio) {
                this.timerEnabledRadio.checked = true;
            }
            if (this.timerMinutesInput) {
                this.timerMinutesInput.value = Math.max(1, Math.min(60, minutes));
            }
        } else {
            if (this.timerDisabledRadio) {
                this.timerDisabledRadio.checked = true;
            }
        }
        
        this.updateTimerVisibility();
    }
    
    reset() {
        // Reset to default values
        if (this.timerDisabledRadio) {
            this.timerDisabledRadio.checked = true;
        }
        
        if (this.timerMinutesInput) {
            this.timerMinutesInput.value = 2;
        }
        
        this.updateTimerVisibility();
    }
    
    // Helper method to format time for display
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    
    // Method to validate timer settings
    validateSettings() {
        const settings = this.getTimerSettings();
        
        if (settings.enabled) {
            if (settings.minutes < 1 || settings.minutes > 60) {
                return {
                    valid: false,
                    message: 'Timer süresi 1-60 dakika arasında olmalıdır.'
                };
            }
        }
        
        return {
            valid: true,
            message: ''
        };
    }
    
    // Method to show timer preview
    showTimerPreview() {
        const settings = this.getTimerSettings();
        
        if (settings.enabled) {
            return `${settings.minutes} dakika`;
        } else {
            return 'Kapalı';
        }
    }
    
    // Method to get timer configuration for quiz
    getTimerConfig() {
        const settings = this.getTimerSettings();
        
        return {
            enabled: settings.enabled,
            duration: settings.seconds,
            minutes: settings.minutes,
            format: this.formatTime(settings.seconds)
        };
    }
    
    onSettingsChanged(callback) {
        this.callbacks.push(callback);
    }
    
    notifySettingsChanged() {
        const settings = this.getTimerSettings();
        this.callbacks.forEach(callback => callback(settings));
    }
} 