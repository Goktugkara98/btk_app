import { eventBus } from './EventBus.js';

/**
 * StateManager - Merkezi durum (state) yönetimi.
 * Değişiklik bildirimleri olan basit bir state container'ı uygular.
 */
class StateManager {
  constructor(initialState = {}) {
    this.state = {
      // Quiz durumu
      questions: [],
      currentQuestion: null,
      currentQuestionIndex: 0,
      answers: new Map(), // Soru ID'lerini ve verilen cevapları tutar.
      visitedQuestions: new Set(), // Ziyaret edilen soruları takip eder
      totalQuestions: 0,
      
      // Oturum durumu
      sessionId: null,
      quizMode: 'practice', // 'practice' veya 'exam'
      timer: {
        enabled: false,
        remainingTime: 0,
        totalTime: 0,
        remainingTimeSeconds: 0
      },
      
      // Arayüz (UI) durumu
      isLoading: false,
      isSubmitting: false, // Cevap gönderilirken çift tıklamayı önlemek için.
      error: null,
      
      // Başlangıçta verilen state ile birleştirilir.
      ...initialState
    };
    
    // Eğer window nesnesinde session ID varsa, state'i başlat.
    if (window.QUIZ_CONFIG && window.QUIZ_CONFIG.sessionId) {
      this.state.sessionId = window.QUIZ_CONFIG.sessionId;
    } else if (window.QUIZ_SESSION_ID) {
      // Eski format için geriye dönük uyumluluk
      this.state.sessionId = window.QUIZ_SESSION_ID;
    }
  }

  /**
   * Mevcut state'i veya state içindeki belirli bir değeri alır.
   * @param {string} [path] - State özelliğine giden nokta notasyonlu yol (örn: 'timer.remainingTime').
   * @returns {*} State veya state özelliği.
   */
  getState(path) {
    if (!path) return this.state;
    
    return path.split('.').reduce((obj, key) => {
      return obj && obj[key] !== undefined ? obj[key] : undefined;
    }, this.state);
  }

  /**
   * State'i günceller ve aboneleri bilgilendirir.
   * @param {Object} newState - Birleştirilecek yeni state parçası.
   * @param {string} [action] - Hata ayıklama için eylemin türünü belirten opsiyonel string.
   */
  setState(newState, action = 'STATE_UPDATE') {
    const prevState = { ...this.state };
    
    // Yeni state'i mevcut state ile birleştir.
    this.state = { ...this.state, ...newState };

    // State değişikliğini 'state:changed' olayı ile yayınla.
    eventBus.publish('state:changed', {
      action,
      prevState,
      currentState: this.state
    });
  }

  // Sık kullanılan state güncellemeleri için yardımcı metotlar

  setQuestions(questions) {
    // İlk soruyu ziyaret edilmiş olarak işaretle
    const initialVisitedQuestions = new Set();
    if (questions.length > 0) {
      initialVisitedQuestions.add(0);
    }
    

    
    this.setState({ 
      questions,
      currentQuestion: questions[0] || null,
      currentQuestionIndex: 0,
      answers: new Map(), // Yeni sorular geldiğinde eski cevapları temizle
      visitedQuestions: initialVisitedQuestions // İlk soruyu ziyaret edilmiş olarak işaretle
    }, 'SET_QUESTIONS');
  }

  setCurrentQuestionIndex(index) {
    if (index >= 0 && index < this.state.questions.length) {
      // Ziyaret edilen soruları takip et
      const newVisitedQuestions = new Set(this.state.visitedQuestions);
      newVisitedQuestions.add(index);
      

      
      this.setState({
        currentQuestionIndex: index,
        currentQuestion: this.state.questions[index],
        visitedQuestions: newVisitedQuestions
      }, 'SET_CURRENT_QUESTION');
    }
  }

  setAnswer(questionId, answer) {
    // questionId'yi her zaman number olarak sakla
    const numericQuestionId = parseInt(questionId, 10);
    
    console.log('[StateManager] setAnswer called:', {
      questionId,
      numericQuestionId,
      answer,
      questionIdType: typeof questionId,
      currentAnswers: Array.from(this.state.answers.entries())
    });
    
    const newAnswers = new Map(this.state.answers);
    newAnswers.set(numericQuestionId, answer);
    
    console.log('[StateManager] setAnswer result:', {
      newAnswers: Array.from(newAnswers.entries()),
      hasAnswer: newAnswers.has(numericQuestionId),
      getAnswer: newAnswers.get(numericQuestionId)
    });
    
    this.setState({ answers: newAnswers }, 'SET_ANSWER');
  }

  removeAnswer(questionId) {
    // questionId'yi her zaman number olarak sakla
    const numericQuestionId = parseInt(questionId, 10);
    
    console.log('[StateManager] removeAnswer called:', {
      questionId,
      numericQuestionId,
      currentAnswers: Array.from(this.state.answers.entries())
    });
    
    const newAnswers = new Map(this.state.answers);
    newAnswers.delete(numericQuestionId);
    
    console.log('[StateManager] removeAnswer result:', {
      newAnswers: Array.from(newAnswers.entries()),
      hasAnswer: newAnswers.has(numericQuestionId)
    });
    
    this.setState({ answers: newAnswers }, 'REMOVE_ANSWER');
  }

  setTimer(remainingTime, totalTime) {
    this.setState({
      timer: {
        ...this.state.timer,
        enabled: true,
        remainingTime,
        totalTime: totalTime || this.state.timer.totalTime
      }
    }, 'SET_TIMER');
  }

  setLoading(isLoading) {
    this.setState({ isLoading }, 'SET_LOADING');
  }

  setError(error) {
    this.setState({ error }, 'SET_ERROR');
  }
}

// Uygulama genelinde tek bir örnek (singleton) olarak ihraç edilir.
export const stateManager = new StateManager();
