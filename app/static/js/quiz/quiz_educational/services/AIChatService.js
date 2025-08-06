/**
 * AI Chat Service V2
 * Educational quiz modu için AI sohbet hizmetlerini yönetir
 * Yeni modüler API yapısı ile çalışır
 */

class AIChatService {
    constructor() {
        this.baseUrl = '/api/ai';
        this.isEnabled = false;
        this.chatSessionId = null;
        this.checkServiceStatus();
    }

    /**
     * AI servisinin durumunu kontrol eder
     */
    async checkServiceStatus() {
        try {
            const response = await fetch(`${this.baseUrl}/system/status`);
            const data = await response.json();
            
            console.log('🔍 Full AI Chat Response:', data);
            
            if (data.status === 'success') {
                this.isEnabled = data.data.available;
                console.log('🤖 AI Chat Service Status:', data.data);
                console.log('✅ AI Chat Enabled:', this.isEnabled);
            } else {
                console.warn('⚠️ AI Chat Service check failed:', data.message);
                this.isEnabled = false;
            }
        } catch (error) {
            console.error('❌ AI Chat Service status check error:', error);
            this.isEnabled = false;
        }
    }

    /**
     * Servisin aktif olup olmadığını döndürür
     */
    isServiceEnabled() {
        return this.isEnabled;
    }

    /**
     * Chat session başlatır
     * @param {string} quizSessionId - Quiz session ID
     * @param {number} questionId - Aktif soru ID
     * @param {Object} context - Quiz context bilgileri
     * @returns {Promise<Object>} Session bilgileri
     */
    async startChatSession(quizSessionId, questionId, context = {}) {
        if (!this.isEnabled) {
            return {
                success: false,
                error: 'AI Chat service is not available'
            };
        }

        try {
            // Quiz session + question ID kombinasyonu olarak chat session ID oluştur
            const chatSessionId = `chat_${quizSessionId}_${questionId}`;
            
            const response = await fetch(`${this.baseUrl}/session/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    quiz_session_id: quizSessionId,
                    question_id: questionId,
                    chat_session_id: chatSessionId, // Önceden oluşturulan session ID
                    context: context
                })
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                this.chatSessionId = chatSessionId;
                console.log('✅ Chat session started:', this.chatSessionId);
                return {
                    success: true,
                    chatSessionId: this.chatSessionId
                };
            } else {
                return {
                    success: false,
                    error: data.message || 'Failed to start chat session'
                };
            }
        } catch (error) {
            console.error('❌ Start Chat Session Error:', error);
            return {
                success: false,
                error: 'Network error occurred'
            };
        }
    }

    /**
     * Chat mesajı gönderir ve AI yanıtı alır
     * @param {string} message - Gönderilecek mesaj
     * @param {number} currentQuestionId - Mevcut soru ID (opsiyonel)
     * @returns {Promise<Object>} AI yanıtı
     */
    async sendChatMessage(message, currentQuestionId = null) {
        if (!this.isEnabled) {
            throw new Error('AI Chat servisi kullanılamıyor');
        }

        if (!this.chatSessionId) {
            throw new Error('Chat session başlatılmamış');
        }

        if (!message || !message.trim()) {
            throw new Error('Mesaj boş olamaz');
        }

        try {
            const requestBody = {
                message: message.trim(),
                chat_session_id: this.chatSessionId
            };

            if (currentQuestionId) {
                requestBody.question_id = currentQuestionId;
            }

            const response = await fetch(`${this.baseUrl}/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });

            const data = await response.json();

            if (data.status === 'success') {
                return {
                    success: true,
                    message: data.data.ai_response
                };
            } else {
                throw new Error(data.message || 'AI yanıtı alınamadı');
            }
        } catch (error) {
            console.error('❌ AI Chat Message Error:', error);
            throw error;
        }
    }

    /**
     * Hızlı eylemler için AI yanıtı alır (açıkla, ipucu)
     * @param {string} action - 'explain' veya 'hint'
     * @param {number} questionId - Soru ID
     * @returns {Promise<Object>} AI yanıtı
     */
    async sendQuickAction(action, questionId) {
        if (!this.isEnabled) {
            return {
                success: false,
                error: 'AI Chat service is not available'
            };
        }

        if (!this.chatSessionId) {
            return {
                success: false,
                error: 'Chat session not started'
            };
        }

        try {
            const response = await fetch(`${this.baseUrl}/chat/quick-action`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: action,
                    chat_session_id: this.chatSessionId,
                    question_id: questionId
                })
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                return {
                    success: true,
                    message: data.data.ai_response,
                    action: action
                };
            } else {
                return {
                    success: false,
                    error: data.message || 'Unknown error occurred'
                };
            }
        } catch (error) {
            console.error('❌ AI Quick Action Error:', error);
            return {
                success: false,
                error: 'Network error occurred'
            };
        }
    }

    /**
     * Chat session'ının durumunu kontrol eder
     * @returns {boolean} Session aktif mi
     */
    isSessionActive() {
        return this.chatSessionId !== null;
    }

    /**
     * Chat session'ını sonlandırır
     */
    endChatSession() {
        this.chatSessionId = null;
        console.log('🔚 Chat session ended');
    }
    
    /**
     * Chat history'yi getirir
     * @param {number} questionId - Soru ID
     * @returns {Promise<Object>} Chat history
     */
    async getChatHistory(questionId) {
        if (!this.isEnabled) {
            return {
                success: false,
                error: 'AI Chat service is not available'
            };
        }
        
        // Quiz session ID'yi window'dan al
        const quizSessionId = window.QUIZ_CONFIG?.sessionId || window.QUIZ_SESSION_ID;
        if (!quizSessionId) {
            return {
                success: false,
                error: 'Quiz session ID bulunamadı'
            };
        }
        
        // Chat session ID'yi oluştur
        const chatSessionId = `chat_${quizSessionId}_${questionId}`;
        
        try {
            const response = await fetch(`${this.baseUrl}/chat/history?chat_session_id=${chatSessionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (data.status === 'success') {
                return {
                    success: true,
                    messages: data.data.messages || []
                };
            } else {
                return {
                    success: false,
                    error: data.message || 'Chat history alınamadı'
                };
            }
        } catch (error) {
            console.error('❌ Get chat history error:', error);
            return {
                success: false,
                error: 'Network error occurred'
            };
        }
    }

    /**
     * Service health check yapar
     * @returns {Promise<boolean>} Servis sağlıklı mı
     */
    async healthCheck() {
        try {
            const response = await fetch(`${this.baseUrl}/system/health`);
            const data = await response.json();
            
            return data.status === 'success' && data.data.healthy;
        } catch (error) {
            console.error('❌ AI Health Check Error:', error);
            return false;
        }
    }
}

// Export for ES6 modules (default export)
export default AIChatService;

// Export for CommonJS (Node.js compatibility)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIChatService;
}