/**
 * Quiz Start Page - Main Module
 * Handles the overall quiz start page functionality
 */

// Quiz Start Page Main Module
import { QuizSettingsManager } from './sections/settings.js';
import { PreviewPanel } from './sections/preview.js';
import { TimerManager } from './sections/timer.js';
import { FormValidator } from './sections/validator.js';

class QuizStartPage {
    constructor() {
        this.settingsManager = new QuizSettingsManager();
        this.previewPanel = new PreviewPanel();
        this.timerManager = new TimerManager();
        this.validator = new FormValidator();
        
        this.currentStep = 1;
        this.startButton = null;
        this.resetButton = null;
        this.nextStepBtn = null;
        this.prevStepBtn = null;
        
        // Form elements
        this.classSelect = null;
        this.subjectSelect = null;
        this.topicSelect = null;
        
        // Subject data for each class
        this.subjectsByClass = {
            '9': ['matematik', 'fizik', 'kimya', 'biyoloji', 'türkçe', 'tarih'],
            '10': ['matematik', 'fizik', 'kimya', 'biyoloji', 'türkçe', 'tarih', 'coğrafya'],
            '11': ['matematik', 'fizik', 'kimya', 'biyoloji', 'türkçe', 'tarih', 'coğrafya', 'felsefe'],
            '12': ['matematik', 'fizik', 'kimya', 'biyoloji', 'türkçe', 'tarih', 'coğrafya', 'felsefe', 'din']
        };
        
        // Topics for each subject
        this.topicsBySubject = {
            'matematik': ['Sayılar ve İşlemler', 'Cebirsel İfadeler', 'Denklemler', 'Geometri', 'Trigonometri', 'Fonksiyonlar', 'İstatistik', 'Olasılık'],
            'fizik': ['Mekanik', 'Elektrik', 'Manyetizma', 'Optik', 'Termodinamik', 'Dalgalar', 'Atom Fiziği', 'Nükleer Fizik'],
            'kimya': ['Maddenin Yapısı', 'Kimyasal Bağlar', 'Reaksiyonlar', 'Çözeltiler', 'Asitler ve Bazlar', 'Organik Kimya', 'Elektrokimya', 'Termokimya'],
            'biyoloji': ['Hücre Bilimi', 'Genetik', 'Evrim', 'Ekoloji', 'İnsan Fizyolojisi', 'Bitki Biyolojisi', 'Mikrobiyoloji', 'Biyoteknoloji'],
            'türkçe': ['Dil Bilgisi', 'Anlatım Bozuklukları', 'Paragraf', 'Cümle Yapısı', 'Kelime Bilgisi', 'Yazım Kuralları', 'Noktalama', 'Edebiyat'],
            'tarih': ['İlk Çağ', 'Orta Çağ', 'Yeni Çağ', 'Yakın Çağ', 'Osmanlı Tarihi', 'İnkılap Tarihi', 'Çağdaş Türk Tarihi', 'Dünya Tarihi'],
            'coğrafya': ['Doğal Sistemler', 'Beşeri Sistemler', 'Mekansal Sentez', 'Küresel Ortam', 'Çevre ve Toplum'],
            'felsefe': ['Felsefenin Alanı', 'Bilgi Felsefesi', 'Varlık Felsefesi', 'Ahlak Felsefesi', 'Siyaset Felsefesi', 'Bilim Felsefesi'],
            'din': ['İnanç', 'İbadet', 'Ahlak ve Değerler', 'Hz. Muhammed', 'Vahiy ve Akıl', 'İslam ve Bilim', 'Anadoluda İslam', 'İslam Medeniyeti']
        };
    }

    init() {
        // Initialize all modules
        this.settingsManager.init();
        this.previewPanel.init();
        this.timerManager.init();
        this.validator.init();

        // Get DOM elements
        this.getFormElements();
        
        // Connect modules
        this.connectModules();

        // Set up event listeners
        this.setupEventListeners();
    }

    getFormElements() {
        this.classSelect = document.getElementById('class-select');
        this.subjectSelect = document.getElementById('subject-select');
        this.topicSelect = document.getElementById('topic-select');
        this.startButton = document.getElementById('start-quiz-btn');
        this.resetButton = document.getElementById('reset-settings-btn');
        this.nextStepBtn = document.getElementById('next-step-btn');
        this.prevStepBtn = document.getElementById('prev-step-btn');
    }

    connectModules() {
        // Settings changes update preview
        this.settingsManager.onSettingsChanged(() => {
            this.previewPanel.updatePreview(this.settingsManager.getSettings());
            this.updateStepButtons();
        });

        // Timer changes update settings
        this.timerManager.onSettingsChanged((timerSettings) => {
            this.settingsManager.updateSetting('timer', timerSettings.enabled ? 'enabled' : 'disabled');
            this.settingsManager.updateSetting('timerMinutes', timerSettings.minutes);
        });
    }

    setupEventListeners() {
        // Class selection
        if (this.classSelect) {
            this.classSelect.addEventListener('change', (e) => {
                this.handleClassChange(e.target.value);
            });
        }

        // Subject selection
        if (this.subjectSelect) {
            this.subjectSelect.addEventListener('change', (e) => {
                this.handleSubjectChange(e.target.value);
            });
        }

        // Topic selection
        if (this.topicSelect) {
            this.topicSelect.addEventListener('change', (e) => {
                this.handleTopicChange(e.target.value);
            });
        }

        // Step navigation
        if (this.nextStepBtn) {
            this.nextStepBtn.addEventListener('click', () => {
                this.nextStep();
            });
        }

        if (this.prevStepBtn) {
            this.prevStepBtn.addEventListener('click', () => {
                this.prevStep();
            });
        }

        // Start quiz button
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.startQuiz();
            });
        }

        // Reset settings button
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => {
                this.resetSettings();
            });
        }

        // Radio button changes for step 2
        document.addEventListener('change', (e) => {
            if (e.target.name === 'difficulty' || e.target.name === 'timer' || e.target.name === 'quiz-mode') {
                this.handleStep2Change(e.target.name, e.target.value);
            }
        });
    }

    handleClassChange(selectedClass) {
        if (!selectedClass) {
            this.hideSubjectGroup();
            this.hideTopicGroup();
            this.settingsManager.updateSetting('class', '');
            this.settingsManager.updateSetting('subject', '');
            this.settingsManager.updateSetting('topic', '');
            return;
        }

        this.settingsManager.updateSetting('class', selectedClass);
        this.loadSubjects(selectedClass);
        this.showSubjectGroup();
        this.hideTopicGroup();
        this.settingsManager.updateSetting('subject', '');
        this.settingsManager.updateSetting('topic', '');
    }

    handleSubjectChange(selectedSubject) {
        if (!selectedSubject) {
            this.hideTopicGroup();
            this.settingsManager.updateSetting('subject', '');
            this.settingsManager.updateSetting('topic', '');
            return;
        }

        this.settingsManager.updateSetting('subject', selectedSubject);
        this.loadTopics(selectedSubject);
        this.showTopicGroup();
        this.settingsManager.updateSetting('topic', '');
    }

    handleTopicChange(selectedTopic) {
        this.settingsManager.updateSetting('topic', selectedTopic || '');
    }

    handleStep2Change(fieldName, value) {
        switch (fieldName) {
            case 'difficulty':
                this.settingsManager.updateSetting('difficulty', value);
                break;
            case 'quiz-mode':
                this.settingsManager.updateSetting('quizMode', value);
                break;
            case 'timer':
                // Timer manager will handle this
                break;
        }
    }

    loadSubjects(selectedClass) {
        const subjects = this.subjectsByClass[selectedClass] || [];
        this.subjectSelect.innerHTML = '<option value="">Ders seçiniz...</option>';
        
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject;
            option.textContent = this.getSubjectDisplayName(subject);
            this.subjectSelect.appendChild(option);
        });
        
        this.subjectSelect.disabled = false;
    }

    loadTopics(selectedSubject) {
        const topics = this.topicsBySubject[selectedSubject] || [];
        this.topicSelect.innerHTML = '<option value="">Konu seçiniz...</option>';
        
        topics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic;
            option.textContent = topic;
            this.topicSelect.appendChild(option);
        });
        
        this.topicSelect.disabled = false;
    }

    getSubjectDisplayName(subject) {
        const names = {
            'matematik': 'Matematik',
            'fizik': 'Fizik',
            'kimya': 'Kimya',
            'biyoloji': 'Biyoloji',
            'türkçe': 'Türkçe',
            'tarih': 'Tarih',
            'coğrafya': 'Coğrafya',
            'felsefe': 'Felsefe',
            'din': 'Din Kültürü'
        };
        return names[subject] || subject;
    }

    showSubjectGroup() {
        const subjectGroup = document.getElementById('subject-group');
        if (subjectGroup) {
            subjectGroup.style.display = 'block';
        }
    }

    hideSubjectGroup() {
        const subjectGroup = document.getElementById('subject-group');
        if (subjectGroup) {
            subjectGroup.style.display = 'none';
            this.subjectSelect.disabled = true;
        }
    }

    showTopicGroup() {
        const topicGroup = document.getElementById('topic-group');
        if (topicGroup) {
            topicGroup.style.display = 'block';
        }
    }

    hideTopicGroup() {
        const topicGroup = document.getElementById('topic-group');
        if (topicGroup) {
            topicGroup.style.display = 'none';
            this.topicSelect.disabled = true;
        }
    }

    nextStep() {
        if (this.currentStep < 2) {
            this.currentStep++;
            this.updateStepDisplay();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }

    updateStepDisplay() {
        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active', 'completed');
            
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            } else if (stepNum < this.currentStep) {
                step.classList.add('completed');
            }
        });

        // Update form steps
        document.querySelectorAll('.form-step').forEach((step, index) => {
            const stepNum = index + 1;
            step.classList.remove('active');
            
            if (stepNum === this.currentStep) {
                step.classList.add('active');
            }
        });

        this.updateStepButtons();
    }

    updateStepButtons() {
        const settings = this.settingsManager.getSettings();
        
        // Update next step button
        if (this.nextStepBtn) {
            const isStep1Complete = settings.class && settings.subject && settings.topic;
            this.nextStepBtn.disabled = !isStep1Complete;
        }

        // Update start quiz button
        if (this.startButton) {
            const isStep2Complete = this.validator.isSettingsComplete(settings);
            this.startButton.disabled = !isStep2Complete;
        }
    }

    async startQuiz() {
        const settings = this.settingsManager.getSettings();
        
        // Validate settings
        const validation = this.validator.validateSettings(settings);
        if (validation.errors.length > 0) {
            this.previewPanel.showValidationResults(validation);
            return;
        }

        // Show loading state
        this.previewPanel.showLoading();

        try {
            // Build query parameters
            const params = new URLSearchParams({
                class: settings.class || '',
                subject: settings.subject || '',
                topic: settings.topic || '',
                difficulty: settings.difficulty || '',
                timer: settings.timer || '',
                timerMinutes: settings.timerMinutes || '',
                mode: settings.quizMode || ''
            });

            // Redirect to quiz page
            window.location.href = `/quiz?${params.toString()}`;
        } catch (error) {
            console.error('Error starting quiz:', error);
            this.previewPanel.showError('Quiz başlatılırken bir hata oluştu.');
        }
    }

    resetSettings() {
        // Reset form
        if (this.classSelect) this.classSelect.value = '';
        if (this.subjectSelect) {
            this.subjectSelect.value = '';
            this.subjectSelect.disabled = true;
        }
        if (this.topicSelect) {
            this.topicSelect.value = '';
            this.topicSelect.disabled = true;
        }

        // Reset groups
        this.hideSubjectGroup();
        this.hideTopicGroup();

        // Reset to step 1
        this.currentStep = 1;
        this.updateStepDisplay();

        // Reset all managers
        this.settingsManager.reset();
        this.previewPanel.reset();
        this.timerManager.reset();
        this.validator.reset();

        // Update UI
        this.updateStepButtons();
        this.previewPanel.clearValidationMessages();

        // Show success message
        this.previewPanel.showSuccess('Ayarlar başarıyla sıfırlandı.');
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const quizStartPage = new QuizStartPage();
    quizStartPage.init();
}); 