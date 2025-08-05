import { stateManager } from '../core/StateManager.js';
import { eventBus } from '../core/EventBus.js';

/**
 * UIManager - Tüm UI güncellemelerini ve kullanıcı etkileşimlerini yönetir.
 */
export class UIManager {
  constructor() {
    this.elements = {};
    this.initializeElements();
    this.initializeEventListeners();
    this.initializeStateSubscriptions();
  }

  /**
   * DOM eleman referanslarını başlatır.
   */
  initializeElements() {
    const $ = (selector) => document.querySelector(selector);
    
    this.elements = {
      quizContainer: $('.quiz-container'),
      questionText: $('#question-text'),
      optionsContainer: $('#options-container'),
      prevBtn: $('#prev-button'),
      nextBtn: $('#next-button'),
      questionNav: $('#question-nav-list'),
      subjectName: $('.subject-name'),
      topicName: $('.topic-name'),
      difficultyBadge: $('.difficulty-badge'),
      currentQuestionNumber: $('.current-question-number'),
      totalQuestionNumber: $('.total-questions'),
      timerElement: $('.timer'),
      loadingState: $('.loading-state'),
      errorState: $('.error-state'),
      errorMessage: $('.error-message'),
    };

    // Hangi elementlerin bulunamadığını kontrol et ve uyar.
    Object.entries(this.elements).forEach(([key, value]) => {
      if (!value) {
        console.warn(`[UIManager] Element bulunamadı: ${key}`);
      }
    });
  }

  /**
   * UI etkileşimleri için olay dinleyicilerini başlatır.
   */
  initializeEventListeners() {
    // Sonraki Soru Butonu
    this.elements.nextBtn?.addEventListener('click', () => {
      eventBus.publish('question:next');
    });

    // Önceki Soru Butonu
    this.elements.prevBtn?.addEventListener('click', () => {
      eventBus.publish('question:previous');
    });

    // Soru Navigasyonu
    this.elements.questionNav?.addEventListener('click', (e) => {
      const navItem = e.target.closest('.question-nav-item');
      if (navItem?.dataset.index) {
        const index = parseInt(navItem.dataset.index, 10);
        eventBus.publish('question:goTo', { index });
      }
    });

    // Seçenek Seçimi (Event Delegation ile)
    this.elements.optionsContainer?.addEventListener('click', (e) => {
      const optionElement = e.target.closest('.option-item');
      if (optionElement?.dataset.questionId && optionElement?.dataset.optionId) {
        // Eğer bir cevap zaten gönderiliyorsa, yeni bir işlem yapma.
        if (stateManager.getState('isSubmitting')) {
          console.warn('Zaten bir cevap gönderiliyor. Lütfen bekleyin.');
          return;
        }
        
        const { questionId, optionId } = optionElement.dataset;
        
        // Diğer seçeneklerden 'selected' class'ını kaldır.
        this.elements.optionsContainer.querySelectorAll('.option-item').forEach(el => el.classList.remove('selected'));
        // Tıklanan seçeneğe 'selected' class'ını ekle.
        optionElement.classList.add('selected');

        // Olay akışını basitleştir: doğrudan 'answer:submit' olayını yayınla.
        eventBus.publish('answer:submit', { questionId, answer: optionId });
      }
    });
  }

  /**
   * State değişikliklerine abone olur ve UI'ı günceller.
   */
  initializeStateSubscriptions() {
    eventBus.subscribe('state:changed', ({ currentState, prevState }) => {
      // Belirli state değişikliklerine göre UI güncelleme fonksiyonlarını çağır.
      if (prevState.isLoading !== currentState.isLoading) {
        this.toggleLoading(currentState.isLoading);
      }
      if (prevState.error !== currentState.error) {
        this.showError(currentState.error);
      }
      if (prevState.currentQuestion !== currentState.currentQuestion) {
        this.renderQuestion(currentState.currentQuestion);
      }
      if (prevState.questions !== currentState.questions || prevState.currentQuestionIndex !== currentState.currentQuestionIndex || prevState.answers !== currentState.answers) {
        this.updateQuestionNavigation();
        this.updateNavButtons();
        this.updateQuestionNumber();
      }
       if (prevState.timer.remainingTime !== currentState.timer.remainingTime) {
        this.updateTimer(currentState.timer);
      }
    });
  }

  /**
   * Yükleniyor durumunu yönetir.
   */
  toggleLoading(isLoading) {
    if (this.elements.loadingState) {
        this.elements.loadingState.style.display = isLoading ? 'flex' : 'none';
    }
    if (this.elements.quizContainer) {
        this.elements.quizContainer.classList.toggle('loading', isLoading);
    }
  }

  /**
   * Hata mesajını gösterir.
   */
  showError(error) {
    if (!this.elements.errorState || !this.elements.errorMessage) return;
    
    if (error) {
      this.elements.errorMessage.textContent = error.message || 'Bilinmeyen bir hata oluştu.';
      this.elements.errorState.style.display = 'flex';
      // Hatayı 5 saniye sonra otomatik olarak gizle.
      setTimeout(() => {
        if (this.elements.errorState) this.elements.errorState.style.display = 'none';
      }, 5000);
    } else {
      this.elements.errorState.style.display = 'none';
    }
  }

  /**
   * Mevcut soruyu ve seçeneklerini ekrana çizer.
   * @param {Object} question - Soru nesnesi.
   */
  renderQuestion(question) {
    if (!question || !this.elements.questionText || !this.elements.optionsContainer) {
      return;
    }
    
    // Soru metnini güncelle.
    this.elements.questionText.innerHTML = question.question?.text || 'Soru metni yüklenemedi.';
    
    // Seçenekleri temizle ve yeniden oluştur.
    this.elements.optionsContainer.innerHTML = '';
    
    const options = question.question?.options || [];
    const questionId = question.question?.id;
    const selectedAnswer = stateManager.getState('answers').get(questionId);

    options.forEach((option, index) => {
      const optionElement = document.createElement('div');
      const isSelected = selectedAnswer === option.id;
      
      optionElement.className = 'option-item' + (isSelected ? ' selected' : '');
      optionElement.dataset.questionId = questionId;
      optionElement.dataset.optionId = option.id;
      
      optionElement.innerHTML = `
        <div class="option-content">
          <div class="option-letter">${String.fromCharCode(65 + index)}</div>
          <div class="option-text">${option.name || `Seçenek ${index + 1}`}</div>
        </div>
      `;
      // KRİTİK DÜZELTME: Burada artık event listener eklenmiyor.
      // Bu işi `initializeEventListeners`'daki tek bir listener (event delegation) yapıyor.
      this.elements.optionsContainer.appendChild(optionElement);
    });
  }

  /**
   * Soru navigasyonunu günceller.
   */
  updateQuestionNavigation() {
    const { questions, currentQuestionIndex, answers } = stateManager.getState();
    if (!this.elements.questionNav) return;
    
    this.elements.questionNav.innerHTML = questions.map((q, index) => {
      const isCurrent = index === currentQuestionIndex;
      const isAnswered = answers.has(q.question.id);
      const classes = [
        'question-nav-item',
        isCurrent ? 'active' : '',
        isAnswered ? 'answered' : ''
      ].filter(Boolean).join(' ');
      
      return `<div class="${classes}" data-index="${index}">${index + 1}</div>`;
    }).join('');
  }

  /**
   * İleri/Geri butonlarının durumunu günceller.
   */
  updateNavButtons() {
    const { currentQuestionIndex, questions, isSubmitting } = stateManager.getState();
    
    if (this.elements.prevBtn) {
      this.elements.prevBtn.disabled = currentQuestionIndex === 0 || isSubmitting;
    }
    
    if (this.elements.nextBtn) {
      this.elements.nextBtn.disabled = isSubmitting;
      const isLastQuestion = currentQuestionIndex === questions.length - 1;
      this.elements.nextBtn.textContent = isLastQuestion ? 'Quizi Bitir' : 'Sonraki Soru';
    }
  }

  /**
   * Soru numarasını günceller.
   */
  updateQuestionNumber() {
    const { questions, currentQuestionIndex } = stateManager.getState();
    if (this.elements.currentQuestionNumber) {
      this.elements.currentQuestionNumber.textContent = questions.length > 0 ? currentQuestionIndex + 1 : 0;
    }
    if (this.elements.totalQuestionNumber) {
      this.elements.totalQuestionNumber.textContent = questions.length;
    }
  }

  /**
   * Zamanlayıcıyı günceller.
   */
  updateTimer(timer) {
    if (!this.elements.timerElement || !timer?.enabled) return;
    
    const minutes = Math.floor(timer.remainingTime / 60);
    const seconds = timer.remainingTime % 60;
    this.elements.timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    this.elements.timerElement.classList.toggle('warning', timer.remainingTime < 60);
  }
}
