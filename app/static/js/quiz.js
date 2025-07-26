// --- Modern Quiz Uygulaması Mantığı ---
// Yazar: Google Gemini
// Tarih: 26.07.2025
// Açıklama: Kullanıcı deneyimini iyileştirmek ve istenen akışı sağlamak için
// yeniden yapılandırılmış quiz betiği.

class QuizApp {
    /**
     * Kurucu metot, uygulama başladığında çalışır.
     * Gerekli durumları (state), elementleri ve olayları ayarlar.
     */
    constructor() {
        this.quizData = [
            { question: "Türkiye'nin başkenti neresidir?", options: ["İstanbul", "Ankara", "İzmir", "Bursa"], answer: "Ankara" },
            { question: "Mona Lisa tablosu hangi ressama aittir?", options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Salvador Dalí"], answer: "Leonardo da Vinci" },
            { question: "Dünyanın en yüksek dağı hangisidir?", options: ["K2", "Kangchenjunga", "Lhotse", "Everest"], answer: "Everest" },
            { question: "JavaScript hangi tür bir programlama dilidir?", options: ["Derlenen", "Yorumlanan", "Makine", "Assembly"], answer: "Yorumlanan" },
            { question: "Fotosentez sırasında bitkiler hangi gazı alır?", options: ["Oksijen", "Azot", "Karbondioksit", "Hidrojen"], answer: "Karbondioksit" },
            { question: "Hangi gezegen 'Kızıl Gezegen' olarak bilinir?", options: ["Venüs", "Mars", "Jüpiter", "Satürn"], answer: "Mars" },
            { question: "İlk modern roman olarak kabul edilen eser hangisidir?", options: ["Savaş ve Barış", "Suç ve Ceza", "Don Kişot", "Madam Bovary"], answer: "Don Kişot" },
            { question: "Kimyada 'Au' simgesi hangi elementi temsil eder?", options: ["Gümüş", "Alüminyum", "Altın", "Argon"], answer: "Altın" },
            { question: "İnternetin temelini oluşturan protokol hangisidir?", options: ["HTTP", "FTP", "TCP/IP", "SMTP"], answer: "TCP/IP" },
            { question: "Türkiye Cumhuriyeti'nin kurucusu kimdir?", options: ["İsmet İnönü", "Fevzi Çakmak", "Kazım Karabekir", "Mustafa Kemal Atatürk"], answer: "Mustafa Kemal Atatürk" }
        ];

        // --- 1. Durum (State) Yönetimi ---
        this.state = {
            currentQuestionIndex: 0,
            userAnswers: new Array(this.quizData.length).fill(null),
            timeLeft: 600, // 10 dakika (saniye cinsinden)
            timerId: null
        };

        // --- 2. DOM Elementlerini Seçme ---
        this.elements = {
            mainContainer: document.querySelector('.quiz-container'),
            questionText: document.getElementById('question-text'),
            optionsContainer: document.getElementById('options-container'),
            questionNavContainer: document.getElementById('question-nav-container'),
            currentQuestionSpan: document.getElementById('current-question'),
            totalQuestionsSpan: document.getElementById('total-questions'),
            questionBoxes: document.getElementById('question-boxes'),
            timerSpan: document.getElementById('timer'),
            prevBtn: document.getElementById('prev-btn'),
            nextBtn: document.getElementById('next-btn')
        };

        // --- 3. Uygulamayı Başlatma ---
        this.init();
    }

    /**
     * Uygulamayı başlatan ana metot.
     */
    init() {
        this.elements.totalQuestionsSpan.textContent = this.quizData.length;
        this.createQuestionBoxes();
        this.displayQuestion(this.state.currentQuestionIndex);
        this.bindEvents();
        this.startTimer();
        this.animateInitialLoad();
    }

    /**
     * Belirtilen index'teki soruyu ve seçeneklerini ekranda gösterir.
     * @param {number} index - Gösterilecek sorunun index'i.
     */
    displayQuestion(index) {
        this.state.currentQuestionIndex = index;
        const question = this.quizData[index];

        // Soru metnini güncelle
        this.elements.questionText.textContent = question.question;

        // Seçenekleri temizle ve yeniden oluştur
        this.elements.optionsContainer.innerHTML = '';
        question.options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = option;

            // Eğer bu soru daha önce cevaplandıysa, seçimi işaretle
            if (this.state.userAnswers[index] === option) {
                button.classList.add('selected');
            }
            this.elements.optionsContainer.appendChild(button);
        });
        
        // Animasyon ile soruyu göster
        if (gsap) {
             gsap.fromTo('.question-card', 
                { opacity: 0, x: 50 },
                { duration: 0.5, opacity: 1, x: 0, ease: 'power2.out' }
            );
        }

        this.updateUI();
    }

    /**
     * Kullanıcı arayüzündeki tüm dinamik elementleri günceller.
     * (İlerleme, navigasyon butonları, soru numaraları vb.)
     */
    updateUI() {
        // İlerleme metnini güncelle: "Soru 1/10"
        this.elements.currentQuestionSpan.textContent = this.state.currentQuestionIndex + 1;

        // Soru kutularını güncelle
        const boxes = this.elements.questionBoxes.children;
        for (let i = 0; i < boxes.length; i++) {
            boxes[i].classList.remove('active', 'answered');
            if (this.state.userAnswers[i] !== null) {
                boxes[i].classList.add('answered');
            }
            if (i === this.state.currentQuestionIndex) {
                boxes[i].classList.add('active');
            }
        }

        // Navigasyon butonlarının durumunu güncelle
        this.elements.prevBtn.disabled = this.state.currentQuestionIndex === 0;
        
        const isLastQuestion = this.state.currentQuestionIndex === this.quizData.length - 1;
        if (isLastQuestion) {
            this.elements.nextBtn.textContent = 'Bitir';
            // Son soru cevaplandıysa Bitir butonu aktif, değilse pasif.
            this.elements.nextBtn.disabled = this.state.userAnswers[this.state.currentQuestionIndex] === null;
        } else {
            this.elements.nextBtn.innerHTML = '<span>İleri</span><i class="bi bi-chevron-right"></i>';
            this.elements.nextBtn.disabled = false;
        }
    }

    /**
     * Gerekli tüm olay dinleyicilerini (event listeners) bağlar.
     */
    bindEvents() {
        this.elements.prevBtn.addEventListener('click', () => this.navigateTo('prev'));
        this.elements.nextBtn.addEventListener('click', () => this.navigateTo('next'));
        this.elements.optionsContainer.addEventListener('click', (e) => this.handleAnswerSelection(e));
        this.elements.questionBoxes.addEventListener('click', (e) => this.handleQuestionBoxClick(e));
    }

    /**
     * Bir cevap seçildiğinde çalışır.
     * @param {Event} e - Click olayı.
     */
    handleAnswerSelection(e) {
        if (!e.target.matches('.answer-btn')) return;

        const selectedAnswer = e.target.textContent;
        this.state.userAnswers[this.state.currentQuestionIndex] = selectedAnswer;

        // Diğer seçimleri kaldır ve sadece tıklananı işaretle
        const allOptions = this.elements.optionsContainer.querySelectorAll('.answer-btn');
        allOptions.forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');

        this.updateUI();

        // Otomatik olarak sonraki soruya geç (kısa bir gecikme ile)
        setTimeout(() => {
            this.navigateTo('next');
        }, 500); // 500ms gecikme ile kullanıcı seçimini görebilsin
    }

    /**
     * İleri/Geri butonlarına tıklandığında soruyu değiştirir.
     * @param {string} direction - 'prev' veya 'next'.
     */
    navigateTo(direction) {
        if (this.elements.nextBtn.textContent === 'Bitir') {
            this.endQuiz();
            return;
        }

        const newIndex = direction === 'prev' 
            ? this.state.currentQuestionIndex - 1
            : this.state.currentQuestionIndex + 1;

        if (newIndex >= 0 && newIndex < this.quizData.length) {
            // Animasyon ile eski soruyu kaydır
             if (gsap) {
                gsap.to('.question-card', {
                    duration: 0.3,
                    opacity: 0,
                    x: -50,
                    ease: 'power2.in',
                    onComplete: () => this.displayQuestion(newIndex)
                });
            } else {
                 this.displayQuestion(newIndex);
            }
        }
    }
    
    /**
     * Üstteki soru kutularına tıklandığında ilgili soruya gider.
     * @param {Event} e - Click olayı.
     */
    handleQuestionBoxClick(e) {
        if (!e.target.matches('.question-box')) return;
        const index = parseInt(e.target.dataset.index, 10);
        if (index !== this.state.currentQuestionIndex) {
            this.displayQuestion(index);
        }
    }
    
    /**
     * Zamanlayıcıyı başlatır ve her saniye günceller.
     */
    startTimer() {
        this.state.timerId = setInterval(() => {
            this.state.timeLeft--;
            const minutes = Math.floor(this.state.timeLeft / 60);
            const seconds = this.state.timeLeft % 60;
            this.elements.timerSpan.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

            if (this.state.timeLeft <= 30) {
                this.elements.timerSpan.style.color = '#ff4d4f';
            }

            if (this.state.timeLeft <= 0) {
                this.endQuiz();
            }
        }, 1000);
    }

    /**
     * Testi bitirir ve sonuçlar sayfasına yönlendirir.
     */
    endQuiz() {
        clearInterval(this.state.timerId);
        
        // Sonuç verilerini hazırla
        const resultsData = this.prepareResultsData();
        
        // AJAX ile sonuçlar sayfasına geçiş yap
        this.navigateToResults(resultsData);
    }
    
    /**
     * Sonuç verilerini hazırlar.
     */
    prepareResultsData() {
        let score = 0;
        let correct = 0;
        let incorrect = 0;
        let unanswered = 0;
        
        const questions = this.quizData.map((question, index) => {
            const userAnswer = this.state.userAnswers[index];
            const isCorrect = userAnswer === question.answer;
            
            if (isCorrect) {
                score++;
                correct++;
            } else if (userAnswer === null) {
                unanswered++;
            } else {
                incorrect++;
            }
            
            return {
                question: question.question,
                correctAnswer: question.answer,
                userAnswer: userAnswer,
                isCorrect: isCorrect
            };
        });
        
        const percentage = Math.round((score / this.quizData.length) * 100);
        
        return {
            score: score,
            totalQuestions: this.quizData.length,
            correct: correct,
            incorrect: incorrect,
            unanswered: unanswered,
            percentage: percentage,
            questions: questions
        };
    }
    
    /**
     * Sonuçlar sayfasına sorunsuz geçiş yapar.
     */
    navigateToResults(resultsData) {
        // Sonuç verilerini URL parametresi olarak encode et
        const resultsParam = encodeURIComponent(JSON.stringify(resultsData));
        
        // Loading animasyonu göster
        this.showLoadingAnimation();
        
        // Kısa bir gecikme ile sonuçlar sayfasına yönlendir
        setTimeout(() => {
            window.location.href = `/quiz/results?results=${resultsParam}`;
        }, 800);
    }
    
    /**
     * Yükleme animasyonu gösterir.
     */
    showLoadingAnimation() {
        // Mevcut içeriği temizle
        this.elements.mainContainer.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner">
                    <i class="bi bi-arrow-clockwise"></i>
                </div>
                <h2>Sonuçlarınız Hazırlanıyor...</h2>
                <p>Lütfen bekleyin</p>
            </div>
        `;
        
        // Spinner animasyonu
        const spinner = this.elements.mainContainer.querySelector('.loading-spinner i');
        if (spinner) {
            spinner.style.animation = 'spin 1s linear infinite';
        }
        
        // CSS animasyonu ekle
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
            
            .loading-container {
                text-align: center;
                padding: 3rem 2rem;
            }
            
            .loading-spinner {
                width: 80px;
                height: 80px;
                margin: 0 auto 2rem;
                background: var(--accent-primary);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-size: 2rem;
            }
            
            .loading-container h2 {
                color: var(--text-primary);
                margin-bottom: 0.5rem;
            }
            
            .loading-container p {
                color: var(--text-secondary);
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Üstteki soru kutularını oluşturur.
     */
    createQuestionBoxes() {
        this.quizData.forEach((_, index) => {
            const box = document.createElement('div');
            box.className = 'question-box';
            box.textContent = index + 1;
            box.dataset.index = index;
            box.title = `Soru ${index + 1}`;
            this.elements.questionBoxes.appendChild(box);
        });
        
        // Dinamik boyut ayarlaması
        this.adjustBoxSizes();
        
        // Pencere boyutu değiştiğinde tekrar ayarla
        window.addEventListener('resize', () => this.adjustBoxSizes());
    }
    
    /**
     * Soru kutularının boyutunu ekran genişliğine ve soru sayısına göre ayarlar.
     */
    adjustBoxSizes() {
        const container = this.elements.questionBoxes;
        const boxes = container.children;
        const containerWidth = container.offsetWidth;
        const totalQuestions = this.quizData.length;
        
        // Varsayılan boyutlar
        let boxSize = 40;
        let gap = 8; // 0.5rem = 8px
        
        // Ekran genişliğine göre ayarlama
        if (window.innerWidth <= 480) {
            boxSize = 30;
            gap = 6;
        } else if (window.innerWidth <= 768) {
            boxSize = 35;
            gap = 7;
        } else if (window.innerWidth <= 900) {
            boxSize = 35;
            gap = 6;
        } else if (window.innerWidth <= 1200) {
            boxSize = 38;
            gap = 7;
        }
        
        // Soru sayısına göre otomatik küçültme
        const totalWidth = (boxSize * totalQuestions) + (gap * (totalQuestions - 1));
        const maxWidth = containerWidth - 40; // Biraz margin bırak
        
        if (totalWidth > maxWidth) {
            const scale = maxWidth / totalWidth;
            boxSize = Math.floor(boxSize * scale);
            gap = Math.floor(gap * scale);
        }
        
        // Minimum boyut kontrolü
        boxSize = Math.max(boxSize, 25);
        gap = Math.max(gap, 4);
        
        // CSS değişkenlerini güncelle
        container.style.setProperty('--box-size', `${boxSize}px`);
        container.style.setProperty('--box-gap', `${gap}px`);
        
        // Tüm kutulara boyut uygula
        Array.from(boxes).forEach(box => {
            box.style.width = `${boxSize}px`;
            box.style.height = `${boxSize}px`;
            box.style.fontSize = `${Math.max(boxSize * 0.4, 10)}px`;
        });
        
        // Gap'i güncelle
        container.style.gap = `${gap}px`;
    }

    /**
     * Sayfa ilk yüklendiğinde elementleri animasyonla gösterir.
     */
    animateInitialLoad() {
        if (!gsap) return;
        gsap.from('.top-nav, .question-navigation', { duration: 0.6, y: -50, opacity: 0, ease: 'power2.out', stagger: 0.2 });
        gsap.from('.quiz-container', { duration: 0.7, scale: 0.95, opacity: 0, ease: 'back.out(1.7)', delay: 0.4 });
        gsap.from('.bottom-nav', { duration: 0.6, y: 50, opacity: 0, ease: 'power2.out', delay: 0.6 });
    }
}

// Sayfa tamamen yüklendiğinde QuizApp'i başlat.
document.addEventListener('DOMContentLoaded', () => {
    new QuizApp();
});