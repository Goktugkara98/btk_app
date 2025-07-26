/**
 * Hero Quiz Simulator
 * Interaktif quiz simülasyonu için JavaScript
 */

class HeroQuizSimulator {
    constructor() {
        this.currentQuestion = 0;
        this.selectedAnswer = null;
        this.isAnswered = false;
        this.timer = null;
        this.timeLeft = 90; // 1:30 saniye
        
        this.questions = [
            {
                question: "Aşağıdaki sayılardan hangisi en büyüktür?",
                options: [
                    { letter: "A", text: "1250", correct: true },
                    { letter: "B", text: "999", correct: false },
                    { letter: "C", text: "850", correct: false },
                    { letter: "D", text: "750", correct: false }
                ],
                explanation: "1250 sayısı 4 basamaklı, diğerleri 3 basamaklıdır. Basamak sayısı fazla olan sayı daha büyüktür."
            },
            {
                question: "Hangi sayı 1000 ile 2000 arasındadır?",
                options: [
                    { letter: "A", text: "950", correct: false },
                    { letter: "B", text: "1500", correct: true },
                    { letter: "C", text: "2100", correct: false },
                    { letter: "D", text: "800", correct: false }
                ],
                explanation: "1500 sayısı 1000'den büyük ve 2000'den küçüktür. Diğer seçenekler bu aralıkta değildir."
            },
            {
                question: "1500 sayısının yarısı kaçtır?",
                options: [
                    { letter: "A", text: "500", correct: false },
                    { letter: "B", text: "750", correct: true },
                    { letter: "C", text: "1000", correct: false },
                    { letter: "D", text: "1250", correct: false }
                ],
                explanation: "Bir sayının yarısını bulmak için 2'ye böleriz. 1500 ÷ 2 = 750"
            }
        ];
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.startTimer();
        this.updateQuestion();
    }
    
    bindEvents() {
        // Seçenek tıklama olayları
        const options = document.querySelectorAll('#demo-options .option');
        options.forEach(option => {
            option.addEventListener('click', (e) => {
                if (!this.isAnswered) {
                    this.selectAnswer(e.currentTarget);
                }
            });
        });
        
        // Chat input olayları
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-message');
        
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !chatInput.disabled) {
                this.sendMessage();
            }
        });
        
        sendButton.addEventListener('click', () => {
            if (!sendButton.disabled) {
                this.sendMessage();
            }
        });
    }
    
    selectAnswer(optionElement) {
        // Önceki seçimi temizle
        document.querySelectorAll('#demo-options .option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Yeni seçimi işaretle
        optionElement.classList.add('selected');
        this.selectedAnswer = optionElement;
        
        // Kullanıcı mesajını göster
        const optionText = optionElement.querySelector('.option-text').textContent;
        this.addUserMessage(`Seçeneğim: ${optionText}`);
        
        // AI yanıtını simüle et
        setTimeout(() => {
            this.showAIResponse();
        }, 1000);
    }
    
    showAIResponse() {
        const isCorrect = this.selectedAnswer.dataset.correct === 'true';
        
        if (isCorrect) {
            this.addAIMessage("🎉 Harika! Doğru cevap verdin. Bu soruyu çok iyi anlamışsın!");
        } else {
            const correctOption = document.querySelector('#demo-options .option[data-correct="true"]');
            const correctText = correctOption.querySelector('.option-text').textContent;
            const explanation = this.questions[this.currentQuestion].explanation;
            
            this.addAIMessage(`❌ Yanlış cevap. Doğru cevap: ${correctText}\n\n${explanation}\n\nBir sonraki soruya geçelim mi?`);
        }
        
        this.isAnswered = true;
        
        // 3 saniye sonra yeni soru yükle
        setTimeout(() => {
            this.nextQuestion();
        }, 3000);
    }
    
    nextQuestion() {
        this.currentQuestion = (this.currentQuestion + 1) % this.questions.length;
        this.resetQuestion();
        this.updateQuestion();
    }
    
    resetQuestion() {
        // Seçenekleri temizle
        document.querySelectorAll('#demo-options .option').forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        this.selectedAnswer = null;
        this.isAnswered = false;
        
        // Chat'i temizle
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = `
            <div class="message ai-message">
                <div class="message-content">
                    <p>Yeni soru hazır! Hangi seçeneği düşünüyorsun?</p>
                </div>
                <div class="message-time">Şimdi</div>
            </div>
        `;
    }
    
    updateQuestion() {
        const question = this.questions[this.currentQuestion];
        
        // Soruyu güncelle
        document.getElementById('demo-question').textContent = question.question;
        
        // Seçenekleri güncelle
        const optionsContainer = document.getElementById('demo-options');
        optionsContainer.innerHTML = '';
        
        question.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.dataset.correct = option.correct;
            
            optionElement.innerHTML = `
                <span class="option-letter">${option.letter}</span>
                <span class="option-text">${option.text}</span>
            `;
            
            optionElement.addEventListener('click', () => {
                if (!this.isAnswered) {
                    this.selectAnswer(optionElement);
                }
            });
            
            optionsContainer.appendChild(optionElement);
        });
    }
    
    addUserMessage(text) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user-message';
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
            </div>
            <div class="message-time">Şimdi</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addAIMessage(text) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message ai-message';
        
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${text}</p>
            </div>
            <div class="message-time">Şimdi</div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    sendMessage() {
        const chatInput = document.getElementById('chat-input');
        const message = chatInput.value.trim();
        
        if (message) {
            this.addUserMessage(message);
            chatInput.value = '';
            
            // AI yanıtını simüle et
            setTimeout(() => {
                this.addAIMessage("Mesajını aldım! Seçeneğe tıklayarak cevabını verebilirsin.");
            }, 1000);
        }
    }
    
    scrollToBottom() {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            
            if (this.timeLeft <= 0) {
                this.timeLeft = 90;
                this.nextQuestion();
            }
            
            this.updateTimer();
        }, 1000);
    }
    
    updateTimer() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        const timerElement = document.getElementById('demo-timer');
        
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
}

// Sayfa yüklendiğinde simülatörü başlat
document.addEventListener('DOMContentLoaded', () => {
    new HeroQuizSimulator();
}); 