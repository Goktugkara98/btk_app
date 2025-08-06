/**
 * AI Chat UI Manager
 * Educational quiz modunda AI sohbet arayüzünü yönetir
 */

class AIChatManager {
    constructor(eventBus, aiChatService) {
        this.eventBus = eventBus;
        this.aiChatService = aiChatService;
        this.currentQuestionId = null;
        this.lastQuestionId = null; // Son soru ID'sini takip etmek için
        this.sessionId = null;
        this.isInitialLoad = true; // İlk yükleme kontrolü için
        
        // UI elementleri
        this.chatContainer = document.getElementById('ai-chat-container');
        this.messagesContainer = document.getElementById('ai-chat-messages');
        this.inputField = document.getElementById('ai-chat-input');
        this.sendButton = document.getElementById('ai-send-button');
        this.quickActionButtons = document.querySelectorAll('.quick-action-btn');
        
        this.initialize();
    }

    /**
     * AI Chat Manager'ı başlatır
     */
    initialize() {
        this.setupEventListeners();
        this.setupQuickActions();
        
        // Başlangıçta chat'i disable et
        this.disableChat();
        
        // Sonra service status kontrol et
        this.checkAIServiceStatus();
        
        // Session ID'yi window'dan al
        this.getSessionId();
        
        // Event bus dinleyicileri
        this.eventBus.subscribe('quiz.loaded', (data) => {
            this.sessionId = data.sessionId;
            console.log('🔄 AI Chat Manager - Session ID updated:', this.sessionId);
            
            // İlk soru ID'sini al
            if (window.quizApp && window.quizApp.stateManager) {
                const state = window.quizApp.stateManager.getState();
                if (state && state.questions && state.questions.length > 0) {
                    this.currentQuestionId = state.questions[0].question.id;
                    console.log('🔄 AI Chat Manager - First Question ID:', this.currentQuestionId);
                }
            }
            
            // Chat session'ı otomatik başlatma - sadece kullanıcı etkileşiminde başlat
            console.log('🔄 AI Chat Manager - Quiz loaded, waiting for user interaction to start chat session');
        });
        
        // Soru değiştiğinde sadece question ID'yi güncelle, session başlatma
        this.eventBus.subscribe('question.changed', (data) => {
            this.currentQuestionId = data.questionId;
            console.log('🔄 AI Chat Manager - Question ID updated:', this.currentQuestionId);
        });
        
        this.eventBus.subscribe('question:changed', (data) => {
            this.currentQuestionId = data.questionId;
            this.onQuestionChanged(data);
        });
        
        // Soru değiştiğinde sadece question ID'yi güncelle
        this.eventBus.subscribe('question:next', (data) => {
            console.log('🔄 AI Chat Manager - Next question, updating question ID');
            this.currentQuestionId = data.questionId;
        });
        
        this.eventBus.subscribe('question:previous', (data) => {
            console.log('🔄 AI Chat Manager - Previous question, updating question ID');
            this.currentQuestionId = data.questionId;
        });
        
        // Question rendered event'i setupEventListeners'da dinleniyor, burada kaldırıldı
    }
    
    /**
     * Session ID'yi window veya StateManager'dan alır
     */
    getSessionId() {
        // Önce window.QUIZ_CONFIG'den dene
        if (window.QUIZ_CONFIG && window.QUIZ_CONFIG.sessionId) {
            this.sessionId = window.QUIZ_CONFIG.sessionId;
            console.log('✅ AI Chat Manager - Session ID from QUIZ_CONFIG:', this.sessionId);
            return;
        }
        
        // StateManager'dan dene
        if (window.quizApp && window.quizApp.stateManager) {
            const state = window.quizApp.stateManager.getState();
            if (state && state.sessionId) {
                this.sessionId = state.sessionId;
                console.log('✅ AI Chat Manager - Session ID from StateManager:', this.sessionId);
                
                // Current question ID'yi de al
                if (state.currentQuestion && state.currentQuestion.question && state.currentQuestion.question.id) {
                    this.currentQuestionId = state.currentQuestion.question.id;
                    console.log('✅ AI Chat Manager - Question ID from StateManager:', this.currentQuestionId);
                }
                return;
            }
        }
        
        console.warn('⚠️ AI Chat Manager - Session ID not found');
    }
    
    /**
     * Chat session'ını başlatır
     */
    async initializeChatSession() {
        console.log('🔄 initializeChatSession called - sessionId:', this.sessionId, 'questionId:', this.currentQuestionId, 'serviceEnabled:', this.aiChatService.isServiceEnabled());
        
        if (!this.sessionId || !this.currentQuestionId || !this.aiChatService.isServiceEnabled()) {
            console.warn('⚠️ Cannot initialize chat session - missing sessionId, questionId or service disabled');
            return;
        }

        // Eğer bu soru için zaten session başlatılmışsa, tekrar başlatma
        if (this.aiChatService.chatSessionId && this.aiChatService.chatSessionId.includes(`_${this.currentQuestionId}`)) {
            console.log('🔄 Chat session already initialized for this question, skipping initialization');
            this.enableChat();
            return;
        }

        try {
            // Quiz context bilgilerini al
            const context = {
                subject: this.getContextFromState('subject') || 'Türkçe',
                topic: this.getContextFromState('topic') || 'Sıfat-fiil',
                difficulty: this.getContextFromState('difficulty') || 'kolay'
            };

            console.log('🔄 Starting chat session with context:', context);
            console.log('🔄 Using question ID:', this.currentQuestionId);
            const result = await this.aiChatService.startChatSession(this.sessionId, this.currentQuestionId, context);
            console.log('🔄 Chat session start result:', result);
            
            if (result.success) {
                console.log('✅ Chat session initialized successfully - chatSessionId:', result.chatSessionId);
                this.enableChat();
            } else {
                console.error('❌ Failed to initialize chat session:', result.error);
                this.disableChat();
            }
        } catch (error) {
            console.error('❌ Chat session initialization error:', error);
            this.disableChat();
        }
    }

    /**
     * State'den context bilgisi alır
     */
    getContextFromState(key) {
        if (window.quizApp && window.quizApp.stateManager) {
            const state = window.quizApp.stateManager.getState();
            return state[key] || '';
        }
        return '';
    }
    
    /**
     * AI servisinin durumunu kontrol eder ve UI'yı günceller
     */
    async checkAIServiceStatus() {
        try {
            // AI service'in status check'ini bekle
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Service'ten direkt durumu kontrol et
            await this.aiChatService.checkServiceStatus();
            const isEnabled = this.aiChatService.isServiceEnabled();
            
            console.log('🔍 AI Service Final Status Check:', isEnabled);
            
            if (!isEnabled) {
                console.warn('⚠️ AI Chat Service is not available');
                this.showServiceUnavailableMessage();
                this.disableChat();
            } else {
                console.log('✅ AI Chat Service is available');
                this.hideServiceUnavailableMessage();
                this.enableChat();
                // Session ID varsa chat session'ı başlatma - sadece kullanıcı etkileşiminde başlat
                console.log('🔄 AI Chat Service ready, waiting for user interaction to start chat session');
            }
        } catch (error) {
            console.error('❌ Error checking AI service status:', error);
            this.showServiceUnavailableMessage();
            this.disableChat();
        }
    }
    
    /**
     * Chat'i aktif hale getirir
     */
    enableChat() {
        if (this.inputField) {
            this.inputField.disabled = false;
            this.inputField.placeholder = "Daima'ya soru sor veya yardım iste...";
        }
        
        if (this.sendButton) {
            this.sendButton.disabled = false;
        }
        
        if (this.quickActionButtons && this.quickActionButtons.length > 0) {
            this.quickActionButtons.forEach(button => {
                button.disabled = false;
            });
        }
        
        console.log('✅ AI Chat enabled - UI active');
    }
    
    /**
     * Chat'i deaktif hale getirir
     */
    disableChat() {
        if (this.inputField) {
            this.inputField.disabled = true;
            this.inputField.placeholder = "AI sohbet servisi kullanılamıyor...";
        }
        
        if (this.sendButton) {
            this.sendButton.disabled = true;
        }
        
        if (this.quickActionButtons && this.quickActionButtons.length > 0) {
            this.quickActionButtons.forEach(button => {
                button.disabled = true;
            });
        }
        
        console.log('❌ AI Chat disabled - UI inactive');
    }
    
    /**
     * Servis kullanılamıyor mesajını gösterir
     */
    showServiceUnavailableMessage() {
        if (this.chatContainer) {
            const existingMessage = this.chatContainer.querySelector('.service-unavailable-message');
            if (!existingMessage) {
                const message = document.createElement('div');
                message.className = 'service-unavailable-message alert alert-warning mb-3';
                message.innerHTML = `
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    AI sohbet servisi şu anda kullanılamıyor.
                `;
                this.chatContainer.prepend(message);
            }
        }
    }
    
    /**
     * Servis kullanılamıyor mesajını gizler
     */
    hideServiceUnavailableMessage() {
        if (this.chatContainer) {
            const message = this.chatContainer.querySelector('.service-unavailable-message');
            if (message) {
                message.remove();
            }
        }
    }

    /**
     * Event listener'ları ayarlar
     */
    setupEventListeners() {
        // Send butonu
        this.sendButton?.addEventListener('click', () => {
            this.sendMessage();
        });

        // Enter tuşu ile mesaj gönderme
        this.inputField?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Input field otomatik boyutlandırma
        this.inputField?.addEventListener('input', () => {
            this.autoResizeTextarea();
        });

        // Question rendered event'ini dinle
        this.eventBus.subscribe('question:rendered', (data) => {
            console.log('🔄 AI Chat Manager - Question Rendered Data:', data);
            this.handleQuestionChange(data);
        });

        // Yanlış cevap event'ini dinle
        this.eventBus.subscribe('answer:incorrect', (data) => {
            console.log('🔄 AI Chat Manager - Incorrect Answer Event:', data);
            this.handleIncorrectAnswer(data);
        });

        // Soru navigasyonu event'ini dinle
        this.eventBus.subscribe('question:navigated', (data) => {
            console.log('🔄 AI Chat Manager - Question Navigation Event:', data);
            this.handleQuestionNavigation(data);
        });
    }

    /**
     * Hızlı eylem butonlarını ayarlar
     */
    setupQuickActions() {
        this.quickActionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.getAttribute('data-action');
                this.handleQuickAction(action);
            });
        });
    }

    /**
     * Hoş geldin mesajını gösterir
     */
    showWelcomeMessage() {
        // Eğer daha önce mesaj varsa tekrar ekleme
        if (this.messagesContainer && this.messagesContainer.children.length > 0) {
            return;
        }
        
        if (this.aiChatService.isServiceEnabled()) {
            this.addMessage('ai', 'Merhaba! Ben Daima, senin AI öğretmenin! Sorularınla ilgili yardıma ihtiyacın var mı? 🤖✨');
        } else {
            this.addMessage('system', 'AI Chat servisi şu anda kullanılamıyor. 😔');
        }
    }

    /**
     * Soru değiştiğinde çağrılır
     */
    onQuestionChanged(data) {
        // Yeni soru hakkında bilgi mesajı ekle
        const subject = data.subject || 'Bu ders';
        const topic = data.topic || 'bu konu';
        
        this.addMessage('ai', `${subject} - ${topic} hakkında bir soru! Yardıma ihtiyacın var mı? 🤔`);
    }

    /**
     * Soru değişimini işler
     */
    handleQuestionChange(data) {
        // StateManager'dan current question index'ini al
        if (window.quizApp && window.quizApp.stateManager) {
            const state = window.quizApp.stateManager.getState();
            console.log('🔄 AI Chat Manager - StateManager State:', state);
            
            if (state && state.currentQuestionIndex !== undefined && state.questions && state.questions.length > 0) {
                const currentQuestion = state.questions[state.currentQuestionIndex];
                console.log('🔄 AI Chat Manager - Current question from index:', currentQuestion);
                
                if (currentQuestion && currentQuestion.question && currentQuestion.question.id) {
                    this.currentQuestionId = currentQuestion.question.id;
                    console.log('🔄 AI Chat Manager - Question ID from current question:', this.currentQuestionId);
                }
            }
        }
        
        // Eğer StateManager'dan alamadıysak, event data'dan dene
        if (!this.currentQuestionId) {
            this.currentQuestionId = data.questionId || data.question?.id || data.id;
            console.log('🔄 AI Chat Manager - Question ID from event data:', this.currentQuestionId);
        }
        
        console.log('🔄 AI Chat Manager - Final Question ID:', this.currentQuestionId);
        
        // Question ID'yi güncelle, session başlatma - sadece kullanıcı etkileşiminde başlat
        this.lastQuestionId = this.currentQuestionId;
    }

    /**
     * Yanlış cevap verildiğinde çağrılır
     */
    async handleIncorrectAnswer(data) {
        console.log('🔄 AI Chat Manager - Handling incorrect answer:', data);
        
        // Chat session'ı başlat
        await this.initializeChatSession();
        
        // Yanlış cevap bilgisini AI'ya gönder
        const message = `Kullanıcı yanlış cevap verdi. Soru ID: ${data.questionId}, Kullanıcının cevabı: ${data.userAnswer}, Doğru cevap: ${data.correctAnswer}. Lütfen bu yanlış cevabı analiz et ve kullanıcıya yardımcı ol.`;
        
        try {
            // AI'dan yanıt al
            const response = await this.aiChatService.sendChatMessage(message, this.currentQuestionId);
            
            if (response.success) {
                this.addMessage('ai', response.message);
            } else {
                this.addMessage('system', 'Yanlış cevap analizi yapılamadı.');
            }
        } catch (error) {
            console.error('Yanlış cevap analizi hatası:', error);
            this.addMessage('system', 'Yanlış cevap analizi sırasında hata oluştu.');
        }
    }

    /**
     * Soru navigasyonu işler
     */
    handleQuestionNavigation(data) {
        console.log('🔄 AI Chat Manager - Handling question navigation:', data);
        
        // İlk yüklemede navigasyon işlemi yapma
        if (this.isInitialLoad) {
            console.log('🔄 AI Chat Manager - Initial load, skipping navigation handling');
            this.isInitialLoad = false;
            return;
        }
        
        // Navigasyon türüne göre işlem yap
        const navigationType = data.type || 'unknown';
        
        if (navigationType === 'forward') {
            // İleri gidildi - chat temizle
            this.clearChat();
            console.log('🔄 AI Chat Manager - Forward navigation, chat cleared');
        } else if (navigationType === 'backward') {
            // Geri gidildi - chat history yükle
            // Ancak ilk yüklemede chat session henüz başlatılmamışsa yükleme
            if (this.aiChatService.chatSessionId) {
                this.loadChatHistory();
                console.log('🔄 AI Chat Manager - Backward navigation, loading chat history');
            } else {
                console.log('🔄 AI Chat Manager - Backward navigation, but no chat session yet - skipping history load');
            }
        }
    }

    /**
     * Mesaj gönderir
     */
    async sendMessage() {
        const message = this.inputField?.value?.trim();
        
        if (!message) return;
        
        // Session ID kontrolü
        if (!this.sessionId) {
            this.getSessionId(); // Tekrar dene
            if (!this.sessionId) {
                this.addMessage('system', 'Quiz session bilgisi bulunamadı. Lütfen sayfayı yenileyin. 🔄');
                return;
            }
        }
        
        // Chat session'ı başlat
        await this.initializeChatSession();
        
        // Kullanıcı mesajını ekle
        this.addMessage('user', message);
        this.inputField.value = '';
        this.autoResizeTextarea();
        
        // Loading durumu göster
        this.showTyping();
        
        try {
            // AI'dan yanıt al
            const response = await this.aiChatService.sendChatMessage(
                message, 
                this.currentQuestionId
            );
            
            this.hideTyping();
            
            if (response.success) {
                this.addMessage('ai', response.message);
            } else {
                this.addMessage('system', `Üzgünüm, bir hata oluştu: ${response.error}`);
            }
        } catch (error) {
            this.hideTyping();
            this.addMessage('system', 'Bağlantı hatası. Lütfen tekrar deneyin. 😞');
            console.error('AI Chat Error:', error);
        }
    }

    /**
     * Hızlı eylem işler
     */
    async handleQuickAction(action) {
        if (!this.sessionId || !this.currentQuestionId) {
            this.addMessage('system', 'Önce bir soru yüklenmeli. 🤨');
            return;
        }

        // Chat session'ı başlat
        await this.initializeChatSession();

        // Loading durumu göster
        this.showTyping();
        
        try {
            const response = await this.aiChatService.sendQuickAction(action, this.currentQuestionId);
            
            this.hideTyping();
            
            if (response.success) {
                const actionText = action === 'explain' ? 'Açıklama' : 'İpucu';
                this.addMessage('ai', response.message, actionText);
            } else {
                this.addMessage('system', `Üzgünüm, ${action} alınamadı: ${response.error}`);
            }
        } catch (error) {
            this.hideTyping();
            this.addMessage('system', 'Bağlantı hatası. Lütfen tekrar deneyin. 😞');
            console.error('AI Quick Action Error:', error);
        }
    }

    /**
     * Mesaj ekler
     */
    addMessage(type, content, label = null) {
        if (!this.messagesContainer) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${type}-message`;
        
        const time = new Date().toLocaleTimeString('tr-TR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        if (type === 'ai') {
            messageDiv.innerHTML = `
                <div class="ai-message-content">
                    ${label ? `<div class="ai-message-label">${label}</div>` : ''}
                    <div class="ai-message-text">${this.formatMessage(content)}</div>
                    <div class="ai-message-time">${time}</div>
                </div>
            `;
        } else if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="user-message-content">
                    <div class="user-message-text">${this.formatMessage(content)}</div>
                    <div class="user-message-time">${time}</div>
                </div>
            `;
        } else if (type === 'system') {
            messageDiv.innerHTML = `
                <div class="system-message-content">
                    <div class="system-message-text">${content}</div>
                    <div class="system-message-time">${time}</div>
                </div>
            `;
        }
        
        this.messagesContainer?.appendChild(messageDiv);
        this.scrollToBottom();
    }

    /**
     * Typing göstergesi ekler
     */
    showTyping() {
        if (document.querySelector('.typing-indicator')) return;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message typing-indicator';
        typingDiv.innerHTML = `
            <div class="ai-message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.messagesContainer?.appendChild(typingDiv);
        this.scrollToBottom();
    }

    /**
     * Typing göstergesini kaldırır
     */
    hideTyping() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    /**
     * Mesajı formatlar
     */
    formatMessage(message) {
        return message
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }

    /**
     * Textarea'yı otomatik boyutlandırır
     */
    autoResizeTextarea() {
        if (this.inputField) {
            this.inputField.style.height = 'auto';
            this.inputField.style.height = Math.min(this.inputField.scrollHeight, 120) + 'px';
        }
    }

    /**
     * Chat'i temizler
     */
    clearChat() {
        if (this.messagesContainer) {
            this.messagesContainer.innerHTML = '';
        }
        console.log('🧹 Chat cleared');
    }
    
    /**
     * Chat session'ından mesajları yükler
     */
    async loadChatHistory() {
        if (!this.sessionId || !this.currentQuestionId) {
            console.warn('⚠️ Cannot load chat history - missing sessionId or questionId');
            return;
        }
        
        // İlk yüklemede chat history yükleme
        if (this.isInitialLoad) {
            console.log('🔄 AI Chat Manager - Initial load, skipping chat history load');
            return;
        }
        
        // Chat session'ı başlat (eğer başlatılmamışsa)
        await this.initializeChatSession();
        
        try {
            const response = await this.aiChatService.getChatHistory(this.currentQuestionId);
            
            if (response.success && response.messages && response.messages.length > 0) {
                console.log('📚 Loading chat history:', response.messages.length, 'messages');
                
                // Mesajları temizle
                this.clearChat();
                
                // Mesajları yükle
                response.messages.forEach(msg => {
                    this.addMessage(msg.role, msg.content, msg.label);
                });
                
                console.log('✅ Chat history loaded successfully');
            } else {
                console.log('📚 No chat history found for this question - showing welcome message');
                // Chat history yoksa welcome message göster
                this.showWelcomeMessage();
            }
        } catch (error) {
            console.error('❌ Error loading chat history:', error);
            // Hata durumunda welcome message göster
            this.showWelcomeMessage();
        }
    }
    
    /**
     * Mesaj container'ını alta kaydırır
     */
    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTo({
                top: this.messagesContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }
}

// Export for ES6 modules (default export)
export default AIChatManager;

// Export for CommonJS (Node.js compatibility)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIChatManager;
}