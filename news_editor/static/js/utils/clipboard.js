/**
 * Kopyalama işlemleri için utility fonksiyonları
 */

class ClipboardUtils {
    /**
     * Metni panoya kopyalar
     * @param {string} text - Kopyalanacak metin
     * @returns {Promise<boolean>} Kopyalama başarı durumu
     */
    static async copyToClipboard(text) {
        try {
            if (navigator.clipboard) {
                await navigator.clipboard.writeText(text);
                return true;
            } else {
                return this.fallbackCopyTextToClipboard(text);
            }
        } catch (error) {
            console.error('Clipboard copy error:', error);
            return this.fallbackCopyTextToClipboard(text);
        }
    }

    /**
     * Fallback kopyalama yöntemi (eski tarayıcılar için)
     * @param {string} text - Kopyalanacak metin
     * @returns {boolean} Kopyalama başarı durumu
     */
    static fallbackCopyTextToClipboard(text) {
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            return successful;
        } catch (err) {
            console.error('Fallback copy error:', err);
            return false;
        }
    }

    /**
     * Buton metnini geçici olarak değiştirir
     * @param {HTMLElement} button - Buton elementi
     * @param {string} originalText - Orijinal metin
     * @param {string} successText - Başarı metni
     * @param {number} duration - Süre (ms)
     */
    static async copyWithButtonFeedback(button, originalText, successText, duration = 2000) {
        const originalHTML = button.innerHTML;
        
        try {
            const success = await this.copyToClipboard(originalText);
            
            if (success) {
                button.innerHTML = successText;
                setTimeout(() => {
                    button.innerHTML = originalHTML;
                }, duration);
                return true;
            } else {
                throw new Error('Kopyalama başarısız');
            }
        } catch (error) {
            console.error('Copy with feedback error:', error);
            return false;
        }
    }
}

// Global olarak erişilebilir yap
window.ClipboardUtils = ClipboardUtils; 