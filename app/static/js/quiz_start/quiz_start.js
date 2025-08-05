// =============================================================================
// Quiz Start JavaScript - Exam Mode Focus
// Sınav başlatma ekranı için JavaScript modülü
// =============================================================================

class QuizStartManager {
    constructor() {
        this.currentStep = 1;
        this.formData = {
            grade_id: '',
            subject_id: '',
            unit_id: '',
            topic_id: '',
            difficulty: 'random',
            quiz_mode: 'exam', // Always exam mode
            timer_enabled: true, // Always enabled for exam mode
            timer_duration: 30,
            question_count: 20
        };
        
        // Cache for loaded data
        this.grades = [];
        this.subjects = [];
        this.units = [];
        this.topics = [];
        
        this.init();
    }

    async init() {
        console.log('🚀 QuizStartManager başlatılıyor...');
        await this.loadGrades();
        this.bindEvents();
        this.updatePreview();
        this.validateStep1();
        console.log('✅ QuizStartManager başlatıldı');
    }

    bindEvents() {
        // Step navigation
        document.getElementById('next-step-btn')?.addEventListener('click', () => this.nextStep());
        document.getElementById('prev-step-btn')?.addEventListener('click', () => this.prevStep());

        // Form controls
        document.getElementById('class-select')?.addEventListener('change', (e) => this.handleClassChange(e));
        document.getElementById('subject-select')?.addEventListener('change', (e) => this.handleSubjectChange(e));
        document.getElementById('unit-select')?.addEventListener('change', (e) => this.handleUnitChange(e));
        document.getElementById('topic-select')?.addEventListener('change', (e) => this.handleTopicChange(e));

        // Difficulty selection
        document.querySelectorAll('input[name="difficulty"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.handleDifficultyChange(e));
        });

        // Timer settings
        document.getElementById('timer-minutes')?.addEventListener('change', (e) => this.handleTimerDurationChange(e));

        // Question count
        document.getElementById('question-count')?.addEventListener('change', (e) => this.handleQuestionCountChange(e));

        // Action buttons
        const startBtn = document.getElementById('start-quiz-btn');
        const resetBtn = document.getElementById('reset-settings-btn');
        
        if (startBtn) {
            console.log('🔗 Start quiz butonu bulundu, event listener ekleniyor...');
            startBtn.addEventListener('click', () => {
                console.log('🖱️ Start quiz butonuna tıklandı!');
                this.startQuiz();
            });
        } else {
            console.log('❌ Start quiz butonu bulunamadı!');
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }
    }

    // Step Navigation
    nextStep() {
        if (this.currentStep === 1 && this.validateStep1()) {
            this.showStep(2);
        }
    }

    prevStep() {
        if (this.currentStep === 2) {
            this.showStep(1);
        }
    }

    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show target step
        document.getElementById(`step-${stepNumber}`).classList.add('active');

        // Update step indicator
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');
            if (index + 1 < stepNumber) {
                step.classList.add('completed');
            } else if (index + 1 === stepNumber) {
                step.classList.add('active');
            }
        });

        this.currentStep = stepNumber;
        this.updatePreview();
        this.validateCurrentStep();
    }

    // Form Handlers
    handleClassChange(event) {
        const gradeId = event.target.value;
        this.formData.grade_id = gradeId;
        
        if (gradeId) {
            this.loadSubjects(gradeId);
            this.showElement('subject-group');
        } else {
            this.hideElement('subject-group');
            this.hideElement('unit-group');
            this.hideElement('topic-group');
            this.formData.subject_id = '';
            this.formData.unit_id = '';
            this.formData.topic_id = '';
        }
        
        this.updatePreview();
        this.validateStep1();
    }

    handleSubjectChange(event) {
        const subjectId = event.target.value;
        this.formData.subject_id = subjectId;
        
        if (subjectId && subjectId !== 'random') {
            this.loadUnits(subjectId);
            this.showElement('unit-group');
        } else {
            this.hideElement('unit-group');
            this.hideElement('topic-group');
            this.formData.unit_id = '';
            this.formData.topic_id = '';
        }
        
        this.updatePreview();
        this.validateStep1();
    }

    handleUnitChange(event) {
        const unitId = event.target.value;
        this.formData.unit_id = unitId;
        
        if (unitId && unitId !== 'random') {
            this.loadTopics(unitId);
            this.showElement('topic-group');
        } else {
            this.hideElement('topic-group');
            this.formData.topic_id = '';
        }
        
        this.updatePreview();
        this.validateStep1();
    }

    handleTopicChange(event) {
        const topicId = event.target.value;
        this.formData.topic_id = topicId;
        this.updatePreview();
        this.validateStep1();
    }

    handleDifficultyChange(event) {
        this.formData.difficulty = event.target.value;
        this.updatePreview();
    }

    handleTimerDurationChange(event) {
        this.formData.timer_duration = parseInt(event.target.value) || 30;
        this.updatePreview();
    }

    handleQuestionCountChange(event) {
        this.formData.question_count = parseInt(event.target.value) || 20;
        this.updatePreview();
    }

    // Data Loading
    async loadGrades() {
        try {
            console.log('📚 Sınıflar yükleniyor...');
            const response = await fetch('/api/quiz/grades');
            const data = await response.json();
            
            if (data.status === 'success') {
                this.grades = data.data;
                this.populateGradesSelect();
                console.log('✅ Sınıflar yüklendi:', this.grades.length);
            } else {
                console.error('❌ Sınıflar yüklenirken hata:', data.message);
            }
        } catch (error) {
            console.error('❌ Sınıflar yüklenirken hata:', error);
        }
    }

    async loadSubjects(gradeId) {
        try {
            console.log('📖 Dersler yükleniyor... (grade_id:', gradeId, ')');
            const response = await fetch(`/api/quiz/subjects?grade_id=${gradeId}`);
            const data = await response.json();
            
            if (data.status === 'success') {
                this.subjects = data.data;
                this.populateSubjectsSelect();
                console.log('✅ Dersler yüklendi:', this.subjects.length);
            } else {
                console.error('❌ Dersler yüklenirken hata:', data.message);
            }
        } catch (error) {
            console.error('❌ Dersler yüklenirken hata:', error);
        }
    }

    async loadUnits(subjectId) {
        try {
            console.log('📚 Üniteler yükleniyor... (subject_id:', subjectId, ')');
            const response = await fetch(`/api/quiz/units?subject_id=${subjectId}`);
            const data = await response.json();
            
            if (data.status === 'success') {
                this.units = data.data;
                this.populateUnitsSelect();
                console.log('✅ Üniteler yüklendi:', this.units.length);
            } else {
                console.error('❌ Üniteler yüklenirken hata:', data.message);
            }
        } catch (error) {
            console.error('❌ Üniteler yüklenirken hata:', error);
        }
    }

    async loadTopics(unitId) {
        try {
            console.log('📝 Konular yükleniyor... (unit_id:', unitId, ')');
            const response = await fetch(`/api/quiz/topics?unit_id=${unitId}`);
            const data = await response.json();
            
            if (data.status === 'success') {
                this.topics = data.data;
                this.populateTopicsSelect();
                console.log('✅ Konular yüklendi:', this.topics.length);
            } else {
                console.error('❌ Konular yüklenirken hata:', data.message);
            }
        } catch (error) {
            console.error('❌ Konular yüklenirken hata:', error);
        }
    }

    populateGradesSelect() {
        const select = document.getElementById('class-select');
        if (!select) return;

        // Clear existing options except the first one
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }

        // Add new options
        this.grades.forEach(grade => {
            const option = document.createElement('option');
            option.value = grade.id;
            option.textContent = grade.name;
            select.appendChild(option);
        });
    }

    populateSubjectsSelect() {
        const select = document.getElementById('subject-select');
        if (!select) return;

        // Clear all existing options
        select.innerHTML = '';

        // Add "Random" option
        const randomOption = document.createElement('option');
        randomOption.value = 'random';
        randomOption.textContent = 'Rasgele Ders';
        select.appendChild(randomOption);

        // Add new options
        this.subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.id;
            option.textContent = subject.name;
            select.appendChild(option);
        });

        // Enable the select
        select.disabled = false;
    }

    populateUnitsSelect() {
        const select = document.getElementById('unit-select');
        if (!select) return;

        // Clear all existing options
        select.innerHTML = '';

        // Add "Random" option
        const randomOption = document.createElement('option');
        randomOption.value = 'random';
        randomOption.textContent = 'Rasgele Ünite';
        select.appendChild(randomOption);

        // Add new options
        this.units.forEach(unit => {
            const option = document.createElement('option');
            option.value = unit.id;
            option.textContent = unit.name;
            select.appendChild(option);
        });

        // Enable the select
        select.disabled = false;
    }

    populateTopicsSelect() {
        const select = document.getElementById('topic-select');
        if (!select) return;

        // Clear all existing options
        select.innerHTML = '';

        // Add "Random" option
        const randomOption = document.createElement('option');
        randomOption.value = 'random';
        randomOption.textContent = 'Rasgele Konu';
        select.appendChild(randomOption);

        // Add new options
        this.topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.id;
            option.textContent = topic.name;
            select.appendChild(option);
        });

        // Enable the select
        select.disabled = false;
    }

    // Validation
    validateStep1() {
        const isValid = this.formData.grade_id && 
                       this.formData.subject_id && 
                       this.formData.unit_id && 
                       this.formData.topic_id;
        
        const nextBtn = document.getElementById('next-step-btn');
        if (nextBtn) {
            nextBtn.disabled = !isValid;
        }
        
        return isValid;
    }

    validateCurrentStep() {
        if (this.currentStep === 1) {
            return this.validateStep1();
        }
        return true;
    }

    // Preview Updates
    updatePreview() {
        this.updatePreviewItem('class', this.getGradeName(this.formData.grade_id));
        this.updatePreviewItem('subject', this.getSubjectName(this.formData.subject_id));
        this.updatePreviewItem('unit', this.getUnitName(this.formData.unit_id));
        this.updatePreviewItem('topic', this.getTopicName(this.formData.topic_id));
        this.updatePreviewItem('difficulty', this.getDifficultyName(this.formData.difficulty));
        this.updatePreviewItem('timer', this.getTimerText());
        this.updatePreviewItem('question-count', this.getQuestionCountText());
        this.updatePreviewItem('mode', 'Sınav Modu');
        
        this.validateForm();
    }

    updatePreviewItem(field, value) {
        const element = document.getElementById(`preview-${field}`);
        if (element) {
            element.textContent = value || '-';
        }
    }

    getGradeName(gradeId) {
        if (!gradeId) return '-';
        const grade = this.grades.find(g => g.id == gradeId);
        return grade ? grade.name : '-';
    }

    getSubjectName(subjectId) {
        if (!subjectId) return '-';
        if (subjectId === 'random') return 'Rasgele Ders';
        const subject = this.subjects.find(s => s.id == subjectId);
        return subject ? subject.name : '-';
    }

    getUnitName(unitId) {
        if (!unitId) return '-';
        if (unitId === 'random') return 'Rasgele Ünite';
        const unit = this.units.find(u => u.id == unitId);
        return unit ? unit.name : '-';
    }

    getTopicName(topicId) {
        if (!topicId) return '-';
        if (topicId === 'random') return 'Rasgele Konu';
        const topic = this.topics.find(t => t.id == topicId);
        return topic ? topic.name : '-';
    }

    getDifficultyName(difficulty) {
        const difficultyMap = {
            'random': 'Karışık',
            'easy': 'Kolay',
            'medium': 'Orta',
            'hard': 'Zor'
        };
        return difficultyMap[difficulty] || 'Karışık';
    }

    getTimerText() {
        return `${this.formData.timer_duration} dakika`;
    }

    getQuestionCountText() {
        return `${this.formData.question_count} soru`;
    }

    validateForm() {
        const isValid = this.formData.grade_id && 
                       this.formData.subject_id && 
                       this.formData.unit_id && 
                       this.formData.topic_id;
        
        const startBtn = document.getElementById('start-quiz-btn');
        if (startBtn) {
            startBtn.disabled = !isValid;
        }
        
        this.showValidation(isValid);
        
        return isValid;
    }

    showValidation(isValid) {
        const container = document.getElementById('validation-container');
        if (!container) return;

        container.innerHTML = '';
        
        if (!isValid) {
            container.innerHTML = `
                <div class="validation-warning">
                    <i class="fas fa-exclamation-triangle"></i>
                    Sınav başlatmak için tüm gerekli alanları doldurun
                </div>
            `;
        }
    }

    // UI Helpers
    showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'block';
        }
    }

    hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    }

    // Quiz Actions
    async startQuiz() {
        console.log('🚀 startQuiz() çağrıldı');
        console.log('📋 Form verileri:', this.formData);
        
        if (!this.validateForm()) {
            console.log('❌ Form validasyonu başarısız');
            return;
        }
        
        console.log('✅ Form validasyonu başarılı');

        const startBtn = document.getElementById('start-quiz-btn');
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sınav Başlatılıyor...';
        }

        try {
            console.log('🌐 API çağrısı yapılıyor...');
            const response = await fetch('/api/quiz/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.formData)
            });

            console.log('📡 API yanıtı:', response.status);
            const data = await response.json();
            console.log('📄 API verisi:', data);

            if (data.status === 'success') {
                console.log('✅ Quiz oturumu oluşturuldu, yönlendiriliyor...');
                // Quiz oturumu oluşturuldu, quiz sayfasına yönlendir
                window.location.href = `/quiz/screen?session_id=${data.data.session_id}`;
            } else {
                console.log('❌ API hatası:', data.message);
                this.showError(data.message || 'Sınav başlatılırken bir hata oluştu');
            }
        } catch (error) {
            console.error('❌ Quiz başlatılırken hata:', error);
            this.showError('Sınav başlatılırken bir hata oluştu');
        } finally {
            if (startBtn) {
                startBtn.disabled = false;
                startBtn.innerHTML = '<i class="fas fa-play"></i> Sınavı Başlat';
            }
        }
    }

    resetSettings() {
        // Form verilerini sıfırla
        this.formData = {
            grade_id: '',
            subject_id: '',
            unit_id: '',
            topic_id: '',
            difficulty: 'random',
            quiz_mode: 'exam',
            timer_enabled: true,
            timer_duration: 30,
            question_count: 20
        };

        // Form elemanlarını sıfırla
        document.getElementById('class-select').value = '';
        document.getElementById('subject-select').value = '';
        document.getElementById('subject-select').disabled = true;
        document.getElementById('unit-select').value = '';
        document.getElementById('unit-select').disabled = true;
        document.getElementById('topic-select').value = '';
        document.getElementById('topic-select').disabled = true;
        
        // Placeholder'ları ayarla
        document.getElementById('subject-select').innerHTML = '<option value="">Ders seçiniz</option>';
        document.getElementById('unit-select').innerHTML = '<option value="">Ünite seçiniz</option>';
        document.getElementById('topic-select').innerHTML = '<option value="">Konu seçiniz</option>';

        // Radio button'ları sıfırla
        document.querySelector('input[name="difficulty"][value="random"]').checked = true;

        // Input değerlerini sıfırla
        document.getElementById('timer-minutes').value = 30;
        document.getElementById('question-count').value = 20;

        // UI'yi güncelle
        this.hideElement('subject-group');
        this.hideElement('unit-group');
        this.hideElement('topic-group');
        this.showStep(1);
        this.updatePreview();
        this.validateStep1();
    }

    showError(message) {
        const container = document.getElementById('validation-container');
        if (container) {
            container.innerHTML = `
                <div class="validation-error">
                    <i class="fas fa-times-circle"></i>
                    ${message}
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM yüklendi, QuizStartManager oluşturuluyor...');
    new QuizStartManager();
    console.log('✅ QuizStartManager oluşturuldu');
}); 