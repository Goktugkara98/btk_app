/**
 * =============================================================================
 * QUIZ DATA MANAGER - DATA MANAGEMENT
 * =============================================================================
 * 
 * Bu dosya quiz verilerini yönetir.
 * Quiz sorularını yükler, saklar ve erişim sağlar.
 * 
 * Sorumlulukları:
 * - Quiz verilerini yüklemek
 * - Soruları saklamak ve erişim sağlamak
 * - Veri formatını kontrol etmek
 * - Veri hatalarını yönetmek
 */

export class QuizDataManager {
    constructor() {
        this.quizData = null;
        this.questions = [];
        this.currentCategory = null;
        this.timeLimit = 20;
    }

    async loadQuizData() {
        try {
            // Mock data dosyasından yükle
            const response = await fetch('/static/js/quiz-data.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            this.quizData = await response.json();
            this.questions = this.quizData.questions || [];
            this.currentCategory = this.quizData.category || 'Genel Kültür';
            this.timeLimit = this.quizData.timeLimit || 20;
            
            console.log(`✅ Quiz data loaded successfully:`);
            console.log(`   - Category: ${this.currentCategory}`);
            console.log(`   - Questions: ${this.questions.length}`);
            console.log(`   - Time limit: ${this.timeLimit} seconds`);
            
            return true;
        } catch (error) {
            console.error('❌ Failed to load quiz data:', error);
            console.log('🔄 Loading fallback data...');
            this.loadFallbackData();
            return false;
        }
    }

    loadFallbackData() {
        // Fallback data in case JSON loading fails
        this.questions = [
            {
                id: 1,
                text: "Türkiye'nin başkenti neresidir?",
                options: ["İstanbul", "Ankara", "İzmir", "Bursa"],
                correctAnswer: 1,
                explanation: "Ankara, 13 Ekim 1923'ten beri Türkiye'nin başkentidir."
            },
            {
                id: 2,
                text: "Hangi gezegen Güneş'e en yakındır?",
                options: ["Mars", "Venüs", "Merkür", "Dünya"],
                correctAnswer: 2,
                explanation: "Merkür, Güneş Sistemi'ndeki en iç gezegendir."
            },
            {
                id: 3,
                text: "İstanbul hangi yılda fethedilmiştir?",
                options: ["1451", "1453", "1455", "1457"],
                correctAnswer: 1,
                explanation: "İstanbul, 29 Mayıs 1453'te Fatih Sultan Mehmet tarafından fethedilmiştir."
            }
        ];
        this.currentCategory = "Genel Kültür";
        this.timeLimit = 20;
        
        console.log('✅ Fallback data loaded');
    }

    getQuestion(index) {
        if (index >= 0 && index < this.questions.length) {
            return this.questions[index];
        }
        return null;
    }

    getTotalQuestions() {
        return this.questions.length;
    }

    getCurrentCategory() {
        return this.currentCategory;
    }

    getTimeLimit() {
        return this.timeLimit;
    }

    getAllQuestions() {
        return this.questions;
    }

    getQuizData() {
        return this.quizData;
    }

    validateQuestion(question) {
        if (!question || typeof question !== 'object') {
            return false;
        }

        if (!question.text || typeof question.text !== 'string') {
            return false;
        }

        if (!Array.isArray(question.options) || question.options.length < 2) {
            return false;
        }

        if (typeof question.correctAnswer !== 'number' || 
            question.correctAnswer < 0 || 
            question.correctAnswer >= question.options.length) {
            return false;
        }

        return true;
    }

    validateAllQuestions() {
        return this.questions.every(question => this.validateQuestion(question));
    }

    // Mock backend simulation methods
    async saveQuizResults(results) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('📊 Quiz results saved to backend:', results);
        return {
            success: true,
            message: 'Results saved successfully',
            timestamp: new Date().toISOString()
        };
    }

    async getQuizCategories() {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 300));
        
        return [
            { id: 1, name: 'Genel Kültür', description: 'Genel kültür soruları' },
            { id: 2, name: 'Bilim', description: 'Bilim ve teknoloji soruları' },
            { id: 3, name: 'Tarih', description: 'Tarih soruları' },
            { id: 4, name: 'Coğrafya', description: 'Coğrafya soruları' },
            { id: 5, name: 'Spor', description: 'Spor soruları' }
        ];
    }

    async getQuizByCategory(categoryId) {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 400));
        
        // Return different questions based on category
        const categoryQuestions = {
            1: this.questions, // Genel Kültür
            2: this.getScienceQuestions(),
            3: this.getHistoryQuestions(),
            4: this.getGeographyQuestions(),
            5: this.getSportsQuestions()
        };
        
        return categoryQuestions[categoryId] || this.questions;
    }

    // Mock category-specific questions
    getScienceQuestions() {
        return [
            {
                id: 101,
                text: "Hangi element periyodik tabloda 'H' sembolü ile gösterilir?",
                options: ["Helyum", "Hidrojen", "Hafniyum", "Holmiyum"],
                correctAnswer: 1,
                explanation: "H sembolü Hidrojen elementini temsil eder."
            },
            {
                id: 102,
                text: "Işık hangi hızda hareket eder?",
                options: ["299,792 km/s", "199,792 km/s", "399,792 km/s", "499,792 km/s"],
                correctAnswer: 0,
                explanation: "Işık, vakumda saniyede 299,792 kilometre hızla hareket eder."
            }
        ];
    }

    getHistoryQuestions() {
        return [
            {
                id: 201,
                text: "I. Dünya Savaşı hangi yıllar arasında gerçekleşmiştir?",
                options: ["1914-1918", "1915-1919", "1916-1920", "1917-1921"],
                correctAnswer: 0,
                explanation: "I. Dünya Savaşı 1914-1918 yılları arasında gerçekleşmiştir."
            },
            {
                id: 202,
                text: "Amerika'yı ilk keşfeden Viking kaşifi kimdir?",
                options: ["Leif Erikson", "Erik the Red", "Ragnar Lothbrok", "Harald Hardrada"],
                correctAnswer: 0,
                explanation: "Leif Erikson, Amerika'yı ilk keşfeden Viking kaşifidir."
            }
        ];
    }

    getGeographyQuestions() {
        return [
            {
                id: 301,
                text: "Dünya'nın en yüksek dağı hangisidir?",
                options: ["K2", "Everest", "Kangchenjunga", "Lhotse"],
                correctAnswer: 1,
                explanation: "Everest, 8,848 metre yüksekliğiyle Dünya'nın en yüksek dağıdır."
            },
            {
                id: 302,
                text: "Hangi ülke en çok ülkeyle sınır komşusudur?",
                options: ["Rusya", "Çin", "Brezilya", "Fransa"],
                correctAnswer: 1,
                explanation: "Çin, 14 ülkeyle sınır komşusudur."
            }
        ];
    }

    getSportsQuestions() {
        return [
            {
                id: 401,
                text: "Hangi takım en çok UEFA Şampiyonlar Ligi şampiyonluğu kazanmıştır?",
                options: ["Barcelona", "Real Madrid", "Bayern Münih", "Liverpool"],
                correctAnswer: 1,
                explanation: "Real Madrid, 14 kez UEFA Şampiyonlar Ligi şampiyonu olmuştur."
            },
            {
                id: 402,
                text: "Hangi spor dalında 'Grand Slam' terimi kullanılır?",
                options: ["Futbol", "Tenis", "Golf", "Basketbol"],
                correctAnswer: 1,
                explanation: "Grand Slam terimi tenis sporunda kullanılır."
            }
        ];
    }
} 