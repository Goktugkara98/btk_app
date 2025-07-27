/**
 * =============================================================================
 * QUIZ UTILS - UTILITY FUNCTIONS
 * =============================================================================
 * 
 * Bu dosya quiz için yardımcı fonksiyonları içerir.
 * Genel kullanım için utility fonksiyonları sağlar.
 * 
 * Sorumlulukları:
 * - Zaman formatlaması
 * - Skor hesaplaması
 * - Veri doğrulama
 * - DOM yardımcı fonksiyonları
 * - Genel utility fonksiyonları
 */

export class QuizUtils {
    /**
     * Zamanı MM:SS formatında formatlar
     */
    static formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    /**
     * Skor yüzdesini hesaplar
     */
    static calculateScore(correctAnswers, totalQuestions) {
        if (totalQuestions === 0) return 0;
        return Math.round((correctAnswers / totalQuestions) * 100);
    }

    /**
     * Skor seviyesini belirler (A, B, C, D, F)
     */
    static getScoreLevel(score) {
        if (score >= 90) return 'A';
        if (score >= 80) return 'B';
        if (score >= 70) return 'C';
        if (score >= 60) return 'D';
        return 'F';
    }

    /**
     * Skor seviyesine göre renk döndürür
     */
    static getScoreColor(score) {
        if (score >= 90) return '#10B981'; // Green
        if (score >= 80) return '#3B82F6'; // Blue
        if (score >= 70) return '#F59E0B'; // Yellow
        if (score >= 60) return '#F97316'; // Orange
        return '#EF4444'; // Red
    }

    /**
     * Rastgele sayı üretir (min-max arası)
     */
    static randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Array'i karıştırır
     */
    static shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * DOM elementini güvenli şekilde seçer
     */
    static safeQuerySelector(selector, parent = document) {
        try {
            return parent.querySelector(selector);
        } catch (error) {
            console.error(`Invalid selector: ${selector}`, error);
            return null;
        }
    }

    /**
     * DOM elementlerini güvenli şekilde seçer
     */
    static safeQuerySelectorAll(selector, parent = document) {
        try {
            return parent.querySelectorAll(selector);
        } catch (error) {
            console.error(`Invalid selector: ${selector}`, error);
            return [];
        }
    }

    /**
     * Element'i görünür yapar
     */
    static showElement(element) {
        if (element) {
            element.style.display = '';
            element.style.visibility = 'visible';
            element.style.opacity = '1';
        }
    }

    /**
     * Element'i gizler
     */
    static hideElement(element) {
        if (element) {
            element.style.display = 'none';
            element.style.visibility = 'hidden';
            element.style.opacity = '0';
        }
    }

    /**
     * Loading spinner gösterir
     */
    static showLoading(container) {
        if (container) {
            container.innerHTML = `
                <div class="loading-spinner">
                    <div class="spinner"></div>
                    <p>Yükleniyor...</p>
                </div>
            `;
        }
    }

    /**
     * Error mesajı gösterir
     */
    static showError(container, message) {
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <i class="bi bi-exclamation-triangle"></i>
                    <p>${message}</p>
                </div>
            `;
        }
    }

    /**
     * LocalStorage'a veri kaydeder
     */
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    }

    /**
     * LocalStorage'dan veri okur
     */
    static loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
        }
    }

    /**
     * LocalStorage'dan veri siler
     */
    static removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
            return false;
        }
    }

    /**
     * Debounce fonksiyonu
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Throttle fonksiyonu
     */
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
} 