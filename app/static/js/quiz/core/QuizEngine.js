import { stateManager } from './StateManager.js';
import { eventBus } from './EventBus.js';
import { ApiService } from '../services/ApiService.js';

/**
 * QuizEngine - Çekirdek quiz mantığını ve akış kontrolünü yönetir.
 */
export class QuizEngine {
  constructor() {
    this.apiService = new ApiService();
    this.initializeEventListeners();
  }

  /**
   * Quiz akışı için olay dinleyicilerini başlatır.
   */
  initializeEventListeners() {
    eventBus.subscribe('quiz:start', this.loadQuestions.bind(this));
    eventBus.subscribe('question:next', this.nextQuestion.bind(this));
    eventBus.subscribe('question:previous', this.previousQuestion.bind(this));
    eventBus.subscribe('question:goTo', ({ index }) => this.goToQuestion(index));
    
    // 'option:selected' kaldırıldı, doğrudan 'answer:submit' dinleniyor.
    eventBus.subscribe('answer:submit', this.submitAnswer.bind(this));
    
    eventBus.subscribe('quiz:complete', this.completeQuiz.bind(this));
  }

  /**
   * Quiz için soruları yükler.
   */
  async loadQuestions() {
    console.log('[QuizEngine] Sorular yükleniyor...');
    try {
      stateManager.setLoading(true);
      const sessionId = stateManager.getState('sessionId');
      
      if (!sessionId) {
        throw new Error('Geçerli bir oturum ID bulunamadı.');
      }
      
      const response = await this.apiService.fetchQuestions({ sessionId });

      if (!response.data || !Array.isArray(response.data.questions)) {
        throw new Error('API yanıtı geçersiz formatta.');
      }
      
      const questions = response.data.questions;
      console.log(`[QuizEngine] ${questions.length} adet soru yüklendi.`);
      stateManager.setQuestions(questions);
      
      // Gerekirse zamanlayıcıyı başlat.
      if (response.data.timer) {
        stateManager.setTimer(response.data.timer.remaining_time, response.data.timer.total_time);
      }
      
      eventBus.publish('quiz:questionsLoaded');
      
    } catch (error) {
      console.error('[QuizEngine] Sorular yüklenirken hata oluştu:', error);
      stateManager.setError({
        message: 'Sorular yüklenirken bir hata oluştu.',
        details: error.message
      });
    } finally {
      stateManager.setLoading(false);
    }
  }

  /**
   * Sonraki soruya geçer.
   */
  nextQuestion() {
    const { currentQuestionIndex, questions } = stateManager.getState();
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex < questions.length) {
      this.goToQuestion(nextIndex);
    } else {
      // Son sorudayken 'Sonraki Soru' butonu 'Quizi Bitir'e dönüşür ve bu olayı tetikler.
      console.log('[QuizEngine] Quiz tamamlanıyor...');
      eventBus.publish('quiz:complete');
    }
  }

  /**
   * Önceki soruya geçer.
   */
  previousQuestion() {
    const { currentQuestionIndex } = stateManager.getState();
    const prevIndex = currentQuestionIndex - 1;
    if (prevIndex >= 0) {
      this.goToQuestion(prevIndex);
    }
  }

  /**
   * Belirtilen index'teki soruya gider.
   * @param {number} index - Gidilecek sorunun index'i.
   */
  goToQuestion(index) {
    stateManager.setCurrentQuestionIndex(index);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Bir cevabı sunucuya gönderir.
   * @param {Object} answerData - { questionId, answer }
   */
  async submitAnswer({ questionId, answer }) {
    // Eğer zaten bir gönderme işlemi varsa, tekrar göndermeyi engelle.
    if (stateManager.getState('isSubmitting')) {
      return;
    }
    
    console.log(`[QuizEngine] Cevap gönderiliyor: Soru ${questionId}, Cevap ${answer}`);
    
    try {
      // Gönderme başladığında state'i güncelle (UI'ı kilitlemek için).
      stateManager.setState({ isSubmitting: true }, 'SUBMIT_ANSWER_START');
      
      const sessionId = stateManager.getState('sessionId');
      if (!sessionId || !questionId || !answer) {
        throw new Error('Cevap göndermek için gerekli bilgiler eksik.');
      }
      
      // Cevabı anında state'e kaydet (UI'ın hızlı güncellenmesi için).
      stateManager.setAnswer(questionId, answer);
      
      await this.apiService.submitAnswer({ sessionId, questionId, answer });
      
      console.log('[QuizEngine] Cevap başarıyla gönderildi.');
      
      // Kısa bir bekleme sonrası sonraki soruya geç.
      setTimeout(() => this.nextQuestion(), 300);
      
    } catch (error) {
      console.error('[QuizEngine] Cevap gönderilirken hata oluştu:', error);
      stateManager.setError({
        message: 'Cevap gönderilirken bir hata oluştu.',
        details: error.message
      });
    } finally {
      // setTimeout içindeki işlem başlamadan önce isSubmitting'i false yapma riski var.
      // Bu yüzden gecikmeyi de hesaba katarak state'i güncelliyoruz.
      setTimeout(() => {
        stateManager.setState({ isSubmitting: false }, 'SUBMIT_ANSWER_END');
      }, 350);
    }
  }

  /**
   * Quizi tamamlar ve sonuçları gösterir.
   */
  async completeQuiz() {
    if (stateManager.getState('isSubmitting')) return;
    
    console.log('[QuizEngine] Quiz tamamlanıyor ve sonuçlar gönderiliyor...');
    try {
      stateManager.setState({ isLoading: true, isSubmitting: true }, 'QUIZ_COMPLETE_START');
      
      const sessionId = stateManager.getState('sessionId');
      const answers = stateManager.getState('answers');
      
      const results = await this.apiService.completeQuiz({ sessionId, answers });
      
      console.log('[QuizEngine] Quiz başarıyla tamamlandı.', results);
      
      stateManager.setState({ quizCompleted: true, results }, 'QUIZ_COMPLETED');
      eventBus.publish('quiz:completed', { results });
      
      // Sonuç sayfasına yönlendirme gibi bir işlem burada yapılabilir.
      // Örneğin: window.location.href = results.result_url;
      
    } catch (error) {
      console.error('[QuizEngine] Quiz tamamlanırken hata oluştu:', error);
      stateManager.setError({
        message: 'Sınav tamamlanırken bir hata oluştu.',
        details: error.message
      });
    } finally {
      stateManager.setState({ isLoading: false, isSubmitting: false }, 'QUIZ_COMPLETE_END');
    }
  }
}
