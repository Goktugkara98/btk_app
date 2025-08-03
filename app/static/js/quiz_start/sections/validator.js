/**
 * Form Validator
 * Validates quiz settings before starting the quiz
 */

export class FormValidator {
    constructor() {
        this.errors = [];
        this.warnings = [];
    }
    
    init() {
        // Initialize validation state
        this.errors = [];
        this.warnings = [];
    }
    
    validateSettings(settings) {
        this.errors = [];
        this.warnings = [];
        
        // Validate required fields
        this.validateRequiredFields(settings);
        
        // Validate field values
        this.validateFieldValues(settings);
        
        // Validate combinations
        this.validateCombinations(settings);
        
        // Show validation results
        this.showValidationResults();
        
        return this.errors.length === 0;
    }
    
    validateRequiredFields(settings) {
        const requiredFields = [
            { field: 'class', name: 'Sınıf' },
            { field: 'subject', name: 'Ders' },
            { field: 'topic', name: 'Konu' },
            { field: 'difficulty', name: 'Zorluk Seviyesi' }
        ];
        
        requiredFields.forEach(({ field, name }) => {
            if (!settings[field] || settings[field] === '') {
                this.errors.push(`${name} seçimi zorunludur.`);
            }
        });
    }
    
    validateFieldValues(settings) {
        // Validate class
        if (settings.class) {
            const validClasses = ['9', '10', '11', '12'];
            if (!validClasses.includes(settings.class)) {
                this.errors.push('Geçersiz sınıf seçimi.');
            }
        }
        
        // Validate subject
        if (settings.subject && settings.subject !== 'random') {
            const validSubjects = ['matematik', 'fizik', 'kimya', 'biyoloji', 'turkce', 'tarih'];
            if (!validSubjects.includes(settings.subject)) {
                this.errors.push('Geçersiz ders seçimi.');
            }
        }
        
        // Validate difficulty
        if (settings.difficulty && settings.difficulty !== 'random') {
            const validDifficulties = ['kolay', 'orta', 'zor'];
            if (!validDifficulties.includes(settings.difficulty)) {
                this.errors.push('Geçersiz zorluk seviyesi.');
            }
        }
        
        // Validate timer settings
        if (settings.timer === 'enabled') {
            const minutes = parseInt(settings.timerMinutes);
            if (isNaN(minutes) || minutes < 1 || minutes > 60) {
                this.errors.push('Timer süresi 1-60 dakika arasında olmalıdır.');
            }
        }
        
        // Validate quiz mode
        if (settings.quizMode) {
            const validModes = ['practice', 'exam'];
            if (!validModes.includes(settings.quizMode)) {
                this.errors.push('Geçersiz quiz modu.');
            }
        }
    }
    
    validateCombinations(settings) {
        // Check for random selections and provide warnings
        if (settings.subject === 'random') {
            this.warnings.push('Rastgele ders seçimi yapıldı. Quiz konuları karışık olacaktır.');
        }
        
        if (settings.topic === 'random') {
            this.warnings.push('Rastgele konu seçimi yapıldı. Quiz konuları karışık olacaktır.');
        }
        
        if (settings.difficulty === 'random') {
            this.warnings.push('Rastgele zorluk seçimi yapıldı. Quiz zorluk seviyeleri karışık olacaktır.');
        }
        
        // Check for potentially challenging combinations
        if (settings.difficulty === 'zor' && settings.timer === 'enabled') {
            const minutes = parseInt(settings.timerMinutes);
            if (minutes < 3) {
                this.warnings.push('Zor seviye quiz için daha uzun süre önerilir.');
            }
        }
        
        // Check for exam mode with timer disabled
        if (settings.quizMode === 'exam' && settings.timer === 'disabled') {
            this.warnings.push('Sınav modunda zamanlayıcı kullanmanız önerilir.');
        }
    }
    
    showValidationResults() {
        // Clear previous validation messages
        this.clearValidationMessages();
        
        // Show errors
        if (this.errors.length > 0) {
            this.showErrors();
        }
        
        // Show warnings
        if (this.warnings.length > 0) {
            this.showWarnings();
        }
    }
    
    showErrors() {
        const errorContainer = this.createValidationContainer('error');
        
        this.errors.forEach(error => {
            const errorElement = document.createElement('div');
            errorElement.className = 'validation-error';
            errorElement.innerHTML = `
                <i class="bi bi-exclamation-triangle"></i>
                <span>${error}</span>
            `;
            errorContainer.appendChild(errorElement);
        });
        
        this.insertValidationContainer(errorContainer);
    }
    
    showWarnings() {
        const warningContainer = this.createValidationContainer('warning');
        
        this.warnings.forEach(warning => {
            const warningElement = document.createElement('div');
            warningElement.className = 'validation-warning';
            warningElement.innerHTML = `
                <i class="bi bi-exclamation-circle"></i>
                <span>${warning}</span>
            `;
            warningContainer.appendChild(warningElement);
        });
        
        this.insertValidationContainer(warningContainer);
    }
    
    createValidationContainer(type) {
        const container = document.createElement('div');
        container.className = `validation-container validation-${type}`;
        container.innerHTML = `
            <div class="validation-header">
                <i class="bi bi-${type === 'error' ? 'exclamation-triangle' : 'exclamation-circle'}"></i>
                <span>${type === 'error' ? 'Hatalar' : 'Uyarılar'}</span>
            </div>
            <div class="validation-content"></div>
        `;
        
        return container;
    }
    
    insertValidationContainer(container) {
        const previewPanel = document.querySelector('.quiz-preview-panel');
        if (previewPanel) {
            const actionsSection = previewPanel.querySelector('.preview-actions');
            if (actionsSection) {
                actionsSection.insertBefore(container, actionsSection.firstChild);
            }
        }
    }
    
    clearValidationMessages() {
        const existingContainers = document.querySelectorAll('.validation-container');
        existingContainers.forEach(container => {
            container.remove();
        });
    }
    
    reset() {
        this.errors = [];
        this.warnings = [];
        this.clearValidationMessages();
    }
    
    // Helper method to check if settings are complete
    isSettingsComplete(settings) {
        const requiredFields = ['class', 'subject', 'topic', 'difficulty'];
        return requiredFields.every(field => settings[field] && settings[field] !== '');
    }
    
    // Helper method to get validation summary
    getValidationSummary() {
        return {
            isValid: this.errors.length === 0,
            hasWarnings: this.warnings.length > 0,
            errors: [...this.errors],
            warnings: [...this.warnings],
            errorCount: this.errors.length,
            warningCount: this.warnings.length
        };
    }
} 