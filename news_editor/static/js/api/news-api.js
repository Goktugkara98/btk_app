/**
 * Haber editörü API işlemleri
 */

class NewsAPI {
    constructor() {
        this.baseURL = '/news-editor';
    }

    /**
     * Haber metnini işler
     * @param {string} originalNews - Orijinal haber metni
     * @returns {Promise<Object>} İşleme sonucu
     */
    async processNews(originalNews) {
        try {
            const response = await fetch(`${this.baseURL}/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `original_news=${encodeURIComponent(originalNews)}`
            });

            return await response.json();
        } catch (error) {
            console.error('Process news error:', error);
            throw new Error('Metin işleme hatası');
        }
    }

    /**
     * Prompt'u Gemini'ye gönderir
     * @param {string} newsId - Haber ID
     * @param {string} processedPrompt - İşlenmiş prompt
     * @returns {Promise<Object>} Gemini yanıtı
     */
    async sendToGemini(newsId, processedPrompt) {
        try {
            console.log('Sending to Gemini:', { newsId, processedPromptLength: processedPrompt.length });
            
            const response = await fetch(`${this.baseURL}/send-to-gemini`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `news_id=${encodeURIComponent(newsId)}&processed_prompt=${encodeURIComponent(processedPrompt)}`
            });

            console.log('Gemini response status:', response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Gemini API error response:', errorText);
                throw new Error(`HTTP ${response.status}: ${errorText}`);
            }

            const result = await response.json();
            console.log('Gemini API result:', result);
            return result;
        } catch (error) {
            console.error('Send to Gemini error:', error);
            throw new Error('Gemini gönderme hatası');
        }
    }

    /**
     * Haber geçmişini getirir
     * @param {number} page - Sayfa numarası
     * @param {number} limit - Sayfa başına kayıt sayısı
     * @returns {Promise<Object>} Geçmiş listesi
     */
    async getHistory(page = 1, limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/history?page=${page}&limit=${limit}`);
            return await response.json();
        } catch (error) {
            console.error('Get history error:', error);
            throw new Error('Geçmiş getirme hatası');
        }
    }

    /**
     * Haber arama yapar
     * @param {string} searchTerm - Arama terimi
     * @param {number} limit - Limit
     * @returns {Promise<Object>} Arama sonuçları
     */
    async searchNews(searchTerm, limit = 10) {
        try {
            const response = await fetch(`${this.baseURL}/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}`);
            return await response.json();
        } catch (error) {
            console.error('Search news error:', error);
            throw new Error('Arama hatası');
        }
    }

    /**
     * Haber detayını getirir
     * @param {string} newsId - Haber ID
     * @returns {Promise<Object>} Haber detayı
     */
    async getNewsDetail(newsId) {
        try {
            const response = await fetch(`${this.baseURL}/history/${newsId}`);
            return await response.json();
        } catch (error) {
            console.error('Get news detail error:', error);
            throw new Error('Haber detayı getirme hatası');
        }
    }

    /**
     * Haber kaydını siler
     * @param {string} newsId - Haber ID
     * @returns {Promise<Object>} Silme sonucu
     */
    async deleteNews(newsId) {
        try {
            const response = await fetch(`${this.baseURL}/history/${newsId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Delete news error:', error);
            throw new Error('Haber silme hatası');
        }
    }

    /**
     * İstatistikleri getirir
     * @returns {Promise<Object>} İstatistikler
     */
    async getStats() {
        try {
            const response = await fetch(`${this.baseURL}/stats`);
            return await response.json();
        } catch (error) {
            console.error('Get stats error:', error);
            throw new Error('İstatistik getirme hatası');
        }
    }
}

// Global instance oluştur
window.newsAPI = new NewsAPI(); 