/**
 * Metin formatlama işlemleri için utility fonksiyonları
 */

class FormatterUtils {
    /**
     * Markdown formatını HTML'e çevirir
     * @param {string} text - Markdown metni
     * @returns {string} HTML formatında metin
     */
    static markdownToHtml(text) {
        if (!text) return '';
        
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    /**
     * Gemini yanıtından başlık ve özeti çıkarır
     * @param {string} geminiResponse - Gemini yanıtı
     * @returns {Object} Başlık ve özet
     */
    static extractGeminiInfo(geminiResponse) {
        if (!geminiResponse) {
            return { title: '', summary: '' };
        }

        const lines = geminiResponse.split('\n');
        let title = '';
        let summary = '';
        let foundTitle = false;
        let foundSummary = false;

        for (let line of lines) {
            if (line.includes('**Etkili Başlık:**') && !foundTitle) {
                title = line.replace('**Etkili Başlık:**', '').trim();
                foundTitle = true;
            }
            if (line.includes('**Haber Özeti:**') && !foundSummary) {
                summary = line.replace('**Haber Özeti:**', '').trim();
                foundSummary = true;
            }
            if (foundTitle && foundSummary) break;
        }

        return { title, summary };
    }

    /**
     * Tarihi Türkçe formatında formatlar
     * @param {string|Date} date - Tarih
     * @returns {string} Formatlanmış tarih
     */
    static formatDate(date) {
        if (!date) return '';
        
        const dateObj = new Date(date);
        return dateObj.toLocaleString('tr-TR');
    }

    /**
     * Metni belirli uzunlukta kısaltır
     * @param {string} text - Metin
     * @param {number} maxLength - Maksimum uzunluk
     * @param {string} suffix - Son ek
     * @returns {string} Kısaltılmış metin
     */
    static truncateText(text, maxLength = 100, suffix = '...') {
        if (!text) return '';
        
        if (text.length <= maxLength) {
            return text;
        }
        
        return text.substring(0, maxLength) + suffix;
    }

    /**
     * İstatistikleri hesaplar
     * @param {string} text - Metin
     * @returns {Object} İstatistikler
     */
    static calculateStats(text) {
        if (!text) {
            return { words: 0, lines: 0, chars: 0 };
        }

        const words = text.trim().split(/\s+/).length;
        const lines = text.split('\n').length;
        const chars = text.length;

        return { words, lines, chars };
    }

    /**
     * Dosya indirme işlemi
     * @param {string} content - İndirilecek içerik
     * @param {string} filename - Dosya adı
     * @param {string} mimeType - MIME tipi
     */
    static downloadFile(content, filename, mimeType = 'text/plain;charset=utf-8') {
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }
}

// Global olarak erişilebilir yap
window.FormatterUtils = FormatterUtils; 