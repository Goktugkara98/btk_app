// --- Quiz Sonuçları Sayfası JavaScript ---
// Yazar: Google Gemini
// Tarih: 26.07.2025
// Açıklama: Modern ve interaktif quiz sonuçları sayfası

class QuizResults {
    constructor() {
        // URL'den sonuç verilerini al
        this.resultsData = this.getResultsFromURL();
        
        // DOM elementlerini seç
        this.elements = {
            finalScore: document.getElementById('final-score'),
            totalQuestions: document.getElementById('total-questions'),
            scoreTitle: document.getElementById('score-title'),
            scoreMessage: document.getElementById('score-message'),
            correctCount: document.getElementById('correct-count'),
            incorrectCount: document.getElementById('incorrect-count'),
            unansweredCount: document.getElementById('unanswered-count'),
            percentage: document.getElementById('percentage'),
            resultsList: document.getElementById('results-list'),
            reviewBtn: document.getElementById('review-btn'),
            restartBtn: document.getElementById('restart-btn'),
            shareBtn: document.getElementById('share-btn')
        };
        
        // Sayfayı başlat
        this.init();
    }
    
    /**
     * URL'den sonuç verilerini alır
     */
    getResultsFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const resultsParam = urlParams.get('results');
        
        if (resultsParam) {
            try {
                return JSON.parse(decodeURIComponent(resultsParam));
            } catch (e) {
                console.error('Sonuç verileri parse edilemedi:', e);
                return this.getDefaultResults();
            }
        }
        
        return this.getDefaultResults();
    }
    
    /**
     * Varsayılan sonuç verileri (test için)
     */
    getDefaultResults() {
        return {
            score: 7,
            totalQuestions: 10,
            correct: 7,
            incorrect: 2,
            unanswered: 1,
            percentage: 70,
            questions: [
                {
                    question: "Türkiye'nin başkenti neresidir?",
                    correctAnswer: "Ankara",
                    userAnswer: "Ankara",
                    isCorrect: true
                },
                {
                    question: "Mona Lisa tablosu hangi ressama aittir?",
                    correctAnswer: "Leonardo da Vinci",
                    userAnswer: "Vincent van Gogh",
                    isCorrect: false
                },
                {
                    question: "Dünyanın en yüksek dağı hangisidir?",
                    correctAnswer: "Everest",
                    userAnswer: "Everest",
                    isCorrect: true
                },
                {
                    question: "JavaScript hangi tür bir programlama dilidir?",
                    correctAnswer: "Yorumlanan",
                    userAnswer: "Yorumlanan",
                    isCorrect: true
                },
                {
                    question: "Fotosentez sırasında bitkiler hangi gazı alır?",
                    correctAnswer: "Karbondioksit",
                    userAnswer: null,
                    isCorrect: false
                }
            ]
        };
    }
    
    /**
     * Sayfayı başlatır
     */
    init() {
        this.displayResults();
        this.bindEvents();
        this.animatePageLoad();
    }
    
    /**
     * Sonuçları ekranda gösterir
     */
    displayResults() {
        const data = this.resultsData;
        
        // Ana skor bilgilerini güncelle
        this.elements.finalScore.textContent = data.score;
        this.elements.totalQuestions.textContent = data.totalQuestions;
        
        // İstatistikleri güncelle
        this.elements.correctCount.textContent = data.correct;
        this.elements.incorrectCount.textContent = data.incorrect;
        this.elements.unansweredCount.textContent = data.unanswered;
        this.elements.percentage.textContent = `${data.percentage}%`;
        
        // Skor başlığını ve mesajını ayarla
        this.setScoreMessage(data.percentage);
        
        // Detaylı sonuçları göster
        this.displayDetailedResults(data.questions);
    }
    
    /**
     * Skor yüzdesine göre başlık ve mesaj ayarlar
     */
    setScoreMessage(percentage) {
        let title, message;
        
        if (percentage >= 90) {
            title = "Mükemmel!";
            message = "İnanılmaz bir performans! Gerçekten harika!";
        } else if (percentage >= 80) {
            title = "Harika!";
            message = "Çok iyi bir sonuç elde ettiniz!";
        } else if (percentage >= 70) {
            title = "İyi!";
            message = "Güzel bir performans gösterdiniz!";
        } else if (percentage >= 60) {
            title = "Orta";
            message = "Biraz daha çalışmanız gerekiyor.";
        } else if (percentage >= 50) {
            title = "Geçer";
            message = "Daha fazla çalışma ile daha iyi sonuçlar alabilirsiniz.";
        } else {
            title = "Geliştirilmeli";
            message = "Daha fazla çalışmanız ve konuları tekrar etmeniz gerekiyor.";
        }
        
        this.elements.scoreTitle.textContent = title;
        this.elements.scoreMessage.textContent = message;
    }
    
    /**
     * Detaylı sonuçları gösterir
     */
    displayDetailedResults(questions) {
        this.elements.resultsList.innerHTML = '';
        
        questions.forEach((q, index) => {
            const resultItem = document.createElement('div');
            resultItem.className = `result-item ${q.isCorrect ? 'correct' : (q.userAnswer === null ? 'unanswered' : 'incorrect')}`;
            
            const answersHTML = `
                <div class="result-answer correct">
                    <i class="bi bi-check-circle-fill"></i>
                    <span>Doğru Cevap: ${q.correctAnswer}</span>
                </div>
                ${q.userAnswer !== null ? `
                    <div class="result-answer ${q.isCorrect ? 'correct' : 'incorrect'}">
                        <i class="bi ${q.isCorrect ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}"></i>
                        <span>Sizin Cevabınız: ${q.userAnswer}</span>
                    </div>
                ` : `
                    <div class="result-answer unanswered">
                        <i class="bi bi-dash-circle-fill"></i>
                        <span>Bu soruyu boş bıraktınız</span>
                    </div>
                `}
            `;
            
            resultItem.innerHTML = `
                <div class="result-question">${index + 1}. ${q.question}</div>
                <div class="result-answers">
                    ${answersHTML}
                </div>
            `;
            
            this.elements.resultsList.appendChild(resultItem);
        });
    }
    
    /**
     * Olay dinleyicilerini bağlar
     */
    bindEvents() {
        this.elements.reviewBtn.addEventListener('click', () => this.reviewQuiz());
        this.elements.restartBtn.addEventListener('click', () => this.restartQuiz());
        this.elements.shareBtn.addEventListener('click', () => this.shareResults());
    }
    
    /**
     * Quiz'i gözden geçir
     */
    reviewQuiz() {
        // Quiz sayfasına geri dön (sonuçlarla birlikte)
        const resultsParam = encodeURIComponent(JSON.stringify(this.resultsData));
        window.location.href = `/quiz?review=true&results=${resultsParam}`;
    }
    
    /**
     * Quiz'i yeniden başlat
     */
    restartQuiz() {
        // Yeni quiz başlat
        window.location.href = '/quiz';
    }
    
    /**
     * Sonuçları paylaş
     */
    shareResults() {
        const shareText = `Quiz sonucum: ${this.resultsData.score}/${this.resultsData.totalQuestions} (${this.resultsData.percentage}%)`;
        
        if (navigator.share) {
            navigator.share({
                title: 'Quiz Sonucum',
                text: shareText,
                url: window.location.href
            });
        } else {
            // Fallback: clipboard'a kopyala
            navigator.clipboard.writeText(shareText).then(() => {
                this.showNotification('Sonuçlar panoya kopyalandı!');
            });
        }
    }
    
    /**
     * Bildirim göster
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--accent-success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: var(--border-radius);
            box-shadow: var(--shadow-md);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    /**
     * Sayfa yükleme animasyonları
     */
    animatePageLoad() {
        if (!gsap) return;
        
        // Header animasyonu
        gsap.from('.results-header', {
            duration: 0.8,
            y: -50,
            opacity: 0,
            ease: 'power2.out'
        });
        
        // Score card animasyonu
        gsap.from('.score-card', {
            duration: 0.8,
            scale: 0.9,
            opacity: 0,
            delay: 0.2,
            ease: 'back.out(1.7)'
        });
        
        // Stats grid animasyonu
        gsap.from('.stat-card', {
            duration: 0.6,
            y: 30,
            opacity: 0,
            delay: 0.4,
            stagger: 0.1,
            ease: 'power2.out'
        });
        
        // Results section animasyonu
        gsap.from('.results-section', {
            duration: 0.6,
            y: 30,
            opacity: 0,
            delay: 0.6,
            ease: 'power2.out'
        });
        
        // Action buttons animasyonu
        gsap.from('.action-btn', {
            duration: 0.5,
            y: 20,
            opacity: 0,
            delay: 0.8,
            stagger: 0.1,
            ease: 'power2.out'
        });
        
        // Score number animasyonu
        gsap.from('.score-number', {
            duration: 1,
            scale: 0,
            delay: 0.4,
            ease: 'back.out(1.7)'
        });
    }
}

// CSS animasyonları
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Sayfa yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
    new QuizResults();
}); 