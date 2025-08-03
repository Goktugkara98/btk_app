/**
 * Preview Panel Manager
 * Handles the quiz preview panel updates
 */

// Preview Panel - Updates the quiz preview based on current settings
export class PreviewPanel {
    constructor() {
        this.previewElements = {
            class: null,
            subject: null,
            topic: null,
            difficulty: null,
            timer: null,
            mode: null
        };
        this.startButton = null;
        this.validationContainer = null;
    }

    init() {
        // Get preview elements
        this.previewElements.class = document.getElementById('preview-class');
        this.previewElements.subject = document.getElementById('preview-subject');
        this.previewElements.topic = document.getElementById('preview-topic');
        this.previewElements.difficulty = document.getElementById('preview-difficulty');
        this.previewElements.timer = document.getElementById('preview-timer');
        this.previewElements.mode = document.getElementById('preview-mode');

        // Get other elements
        this.startButton = document.getElementById('start-quiz-btn');
        this.validationContainer = document.getElementById('validation-container');

        // Set initial preview
        this.updatePreview({});
    }

    updatePreview(settings) {
        // Update class preview
        if (this.previewElements.class) {
            if (settings.class && settings.class !== 'random') {
                this.previewElements.class.textContent = `${settings.class}. Sınıf`;
            } else {
                this.previewElements.class.textContent = settings.class === 'random' ? 'Rasgele' : '9. Sınıf';
            }
        }

        // Update subject preview
        if (this.previewElements.subject) {
            if (settings.subject && settings.subject !== 'random') {
                const subjectNames = {
                    'matematik': 'Matematik',
                    'fizik': 'Fizik',
                    'kimya': 'Kimya',
                    'biyoloji': 'Biyoloji'
                };
                this.previewElements.subject.textContent = subjectNames[settings.subject] || settings.subject;
            } else {
                this.previewElements.subject.textContent = settings.subject === 'random' ? 'Rasgele' : 'Matematik';
            }
        }

        // Update topic preview
        if (this.previewElements.topic) {
            if (settings.topic && settings.topic !== 'random') {
                this.previewElements.topic.textContent = settings.topic;
            } else {
                this.previewElements.topic.textContent = settings.topic === 'random' ? 'Rasgele' : '-';
            }
        }

        // Update difficulty preview
        if (this.previewElements.difficulty) {
            if (settings.difficulty && settings.difficulty !== 'random') {
                const difficultyNames = {
                    'easy': 'Kolay',
                    'medium': 'Orta',
                    'hard': 'Zor'
                };
                this.previewElements.difficulty.textContent = difficultyNames[settings.difficulty] || settings.difficulty;
            } else {
                this.previewElements.difficulty.textContent = settings.difficulty === 'random' ? 'Rasgele' : 'Kolay';
            }
        }

        // Update timer preview
        if (this.previewElements.timer) {
            if (settings.timer === 'enabled' && settings.timerMinutes) {
                this.previewElements.timer.textContent = `${settings.timerMinutes} dakika`;
            } else {
                this.previewElements.timer.textContent = 'Kapalı';
            }
        }

        // Update mode preview
        if (this.previewElements.mode) {
            if (settings.quizMode) {
                const modeNames = {
                    'practice': 'Pratik Modu',
                    'exam': 'Sınav Modu'
                };
                this.previewElements.mode.textContent = modeNames[settings.quizMode] || settings.quizMode;
            } else {
                this.previewElements.mode.textContent = 'Pratik Modu';
            }
        }
    }

    updateStartButton() {
        if (this.startButton) {
            // This will be handled by the main module
        }
    }

    showLoading() {
        if (this.startButton) {
            this.startButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Başlatılıyor...';
            this.startButton.disabled = true;
        }
    }

    hideLoading() {
        if (this.startButton) {
            this.startButton.innerHTML = '<i class="fas fa-play"></i> Quiz\'i Başlat';
            this.startButton.disabled = false;
        }
    }

    showError(message) {
        this.showValidationResults({
            errors: [message],
            warnings: []
        });
    }

    showSuccess(message) {
        if (this.validationContainer) {
            this.clearValidationMessages();
            
            const successDiv = document.createElement('div');
            successDiv.className = 'validation-success';
            successDiv.style.cssText = `
                background: #d4edda;
                border: 1px solid #c3e6cb;
                color: #155724;
                padding: 0.75rem;
                border-radius: 8px;
                margin-bottom: 0.5rem;
                font-size: 0.9rem;
            `;
            successDiv.textContent = message;
            
            this.validationContainer.appendChild(successDiv);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.remove();
                }
            }, 3000);
        }
    }

    showValidationResults(validation) {
        if (!this.validationContainer) return;

        this.clearValidationMessages();

        // Show errors
        if (validation.errors && validation.errors.length > 0) {
            this.showErrors(validation.errors);
        }

        // Show warnings
        if (validation.warnings && validation.warnings.length > 0) {
            this.showWarnings(validation.warnings);
        }
    }

    showErrors(errors) {
        if (!this.validationContainer) return;

        const errorDiv = document.createElement('div');
        errorDiv.className = 'validation-error';
        errorDiv.innerHTML = `
            <strong>Hata:</strong> ${errors.join(', ')}
        `;
        
        this.validationContainer.appendChild(errorDiv);
    }

    showWarnings(warnings) {
        if (!this.validationContainer) return;

        const warningDiv = document.createElement('div');
        warningDiv.className = 'validation-warning';
        warningDiv.innerHTML = `
            <strong>Uyarı:</strong> ${warnings.join(', ')}
        `;
        
        this.validationContainer.appendChild(warningDiv);
    }

    clearValidationMessages() {
        if (this.validationContainer) {
            this.validationContainer.innerHTML = '';
        }
    }

    reset() {
        // Reset preview to default values
        this.updatePreview({
            class: '9',
            subject: 'matematik',
            topic: '',
            difficulty: 'easy',
            timer: 'enabled',
            timerMinutes: '30',
            quizMode: 'practice'
        });
        
        this.clearValidationMessages();
    }
} 