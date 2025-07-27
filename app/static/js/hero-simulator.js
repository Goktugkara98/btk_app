/**
 * Hero Quiz Simulator
 *
 * Kullanıcı etkileşimli quiz simülasyonu için modern ve yeniden düzenlenmiş JavaScript kodu.
 * Bu sürüm, daha iyi okunabilirlik, performans ve yönetilebilirlik için
 * olay delegasyonu (event delegation), öğe önbellekleme (element caching) ve
 * daha temiz bir mantık akışı kullanır.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Soruları dışarıdan yükle
    fetch('static/js/quiz-data.json')
        .then(res => res.json())
        .then(data => {
            new HeroQuiz(data);
        })
        .catch(() => {
            const quizPanel = document.querySelector('.quiz-panel .rotate-inner') || document.querySelector('.quiz-panel');
            if (quizPanel) quizPanel.innerHTML = '<div style="padding:2rem; color:red;">Soru verisi yüklenemedi.</div>';
        });

    class HeroQuiz {
        constructor(questions) {
            // Soruları karıştır
            this.questions = this.shuffleArray(questions);

            // DOM elements
            this.elements = {
                question: document.getElementById('demo-question'),
                optionsContainer: document.getElementById('demo-options'),
                quizInfo: document.querySelector('.quiz-info'),
                chatMessages: document.getElementById('chat-messages'),
            };

            // Quiz state
            this.currentQuestionIndex = 0;
            this.isAnswered = false;
            this.timerDuration = 15;
            this.timer = null;
            this.timeLeft = this.timerDuration;

            this.init();
        }
        shuffleArray(array) {
            // Fisher-Yates algoritması
            const arr = array.slice();
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        }

        /**
         * Quiz'i başlatan ana fonksiyon
         */
        init() {
            this.bindEvents();
            this.loadQuestion();
        }

        /**
         * Olay dinleyicilerini bağla
         */
        bindEvents() {
            // Seçeneklere tıklamayı yönetmek için olay delegasyonu kullanalım.
            // Bu, her seçenek için ayrı bir dinleyici eklemekten daha verimlidir.
            this.elements.optionsContainer.addEventListener('click', (event) => {
                const selectedOption = event.target.closest('.option');
                if (selectedOption && !this.isAnswered) {
                    this.handleAnswer(selectedOption);
                }
            });
        }





        loadQuestion() {
            this.isAnswered = false;
            const questionData = this.questions[this.currentQuestionIndex];

            // Sadece içerikleri güncelle
            this.elements.question.textContent = questionData.question;

            // Meta tag içeriklerini güncelle
            const metaTags = this.elements.quizInfo.querySelector('.quiz-meta-tags');
            if (metaTags) {
                metaTags.innerHTML = `
                    <span class="quiz-subject">${questionData.subject}</span>
                    <span class="quiz-difficulty">${questionData.difficulty}</span>
                `;
            }

            // Seçenek içeriklerini güncelle (var olanları silip yeniden ekle, container yapısını değiştirme)
            this.elements.optionsContainer.innerHTML = '';
            const optionLetters = ['A', 'B', 'C', 'D'];
            questionData.options.forEach((option, index) => {
                const optionElement = document.createElement('div');
                optionElement.className = 'option';
                optionElement.dataset.correct = option.correct;
                optionElement.innerHTML = `
                    <span class="option-letter">${optionLetters[index]}</span>
                    <span class="option-text">${option.text}</span>
                `;
                this.elements.optionsContainer.appendChild(optionElement);
            });
            // Sohbet geçmişini temizle ve ilk AI mesajını animasyonla göster
            this.elements.chatMessages.innerHTML = '';
            this.addAIMessage("Harika, yeni bir soru! Sence doğru cevap hangisi?");
            this.startTimer();
        }

        /**
         * Kullanıcının cevabını işler
         * @param {HTMLElement} selectedOption - Kullanıcının tıkladığı seçenek öğesi
         */
        handleAnswer(selectedOption) {
            this.isAnswered = true;
            this.clearTimer();
            const isCorrect = selectedOption.dataset.correct === 'true';
            const answerText = selectedOption.querySelector('.option-text').textContent;

            // Kullanıcının seçimini chat'e ekle
            this.addUserMessage(`Seçimim: ${answerText}`);
            selectedOption.classList.add('selected');

            // AI'ın "düşünme" süresi için kısa bir gecikme
            setTimeout(() => {
                this.showResult(isCorrect, selectedOption);
            }, 800);
        }

        /**
         * Sonucu gösterir ve bir sonraki soruya geçer
         * @param {boolean} isCorrect - Cevabın doğru olup olmadığı
         * @param {HTMLElement} selectedOption - Seçilen seçenek
         */
        showResult(isCorrect, selectedOption) {
            const questionData = this.questions[this.currentQuestionIndex];
            const correctOptionElement = this.elements.optionsContainer.querySelector('[data-correct="true"]');
            const selectedIndex = Array.from(this.elements.optionsContainer.children).indexOf(selectedOption);
            const selectedOptionData = questionData.options[selectedIndex];

            if (isCorrect) {
                this.addAIMessage(questionData.correct_explanation || selectedOptionData.explanation || 'Tebrikler, doğru cevap!', () => {
                    setTimeout(() => this.nextQuestion(), 500);
                });
                selectedOption.classList.add('correct');
            } else {
                this.addAIMessage(selectedOptionData.explanation || 'Yanlış cevap.', () => {
                    setTimeout(() => this.nextQuestion(), 500);
                });
                selectedOption.classList.add('incorrect');
                correctOptionElement.classList.add('correct');
            }
        }

        /**
         * Bir sonraki soruya geçer
         */
        nextQuestion() {
            setTimeout(() => {
                this.currentQuestionIndex = (this.currentQuestionIndex + 1) % this.questions.length;
                this.loadQuestion();
            }, 2000);
        }
        
        /**
         * Chat'i başlangıç durumuna getirir
         */
        resetChat() {
            this.clearTimer();
            // Önceki mesajlar silinmesin, sadece yeni mesajlar eklensin
        }

        /**
         * Chat'e AI mesajı ekler
         * @param {string} html - Eklenecek mesaj (HTML içerebilir)
         */
        addAIMessage(html, cb) {
            this.addMessageAnimated(html, 'ai-message', cb);
        }

        /**
         * Chat'e kullanıcı mesajı ekler
         * @param {string} text - Eklenecek düz metin
         */
        addUserMessage(text, cb) {
            this.addMessageAnimated(text, 'user-message', cb);
        }

        /**
         * Chat'e genel mesaj ekleme fonksiyonu
         * @param {string} content - Mesaj içeriği
         * @param {string} type - Mesaj tipi ('ai-message' veya 'user-message')
         */
        addMessageAnimated(content, type, cb) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${type}`;
            const messageContentDiv = document.createElement('div');
            messageContentDiv.className = 'message-content';
            const p = document.createElement('p');
            messageContentDiv.appendChild(p);
            messageDiv.appendChild(messageContentDiv);
            const timeDiv = document.createElement('div');
            timeDiv.className = 'message-time';
            timeDiv.textContent = 'Şimdi';
            messageDiv.appendChild(timeDiv);
            this.elements.chatMessages.appendChild(messageDiv);
            this.scrollToBottom();
            // Typewriter animasyonu
            let i = 0;
            const plainText = content.replace(/<[^>]+>/g, ''); // HTML etiketlerini kaldır
            const typeNext = () => {
                if (i <= plainText.length) {
                    p.textContent = plainText.slice(0, i);
                    i++;
                    this.scrollToBottom();
                    setTimeout(typeNext, 18);
                } else if (cb) {
                    cb();
                }
            };
            typeNext();
        }

        /**
         * Chat penceresini en alta kaydırır
         */
        scrollToBottom() {
            this.elements.chatMessages.scrollTop = this.elements.chatMessages.scrollHeight;
        }

        startTimer() {
            this.clearTimer();
            this.timeLeft = this.timerDuration;
            this.updateTimerDisplay();
            this.timer = setInterval(() => {
                this.timeLeft--;
                this.updateTimerDisplay();
                if (this.timeLeft <= 0) {
                    this.clearTimer();
                    if (!this.isAnswered) {
                        // Süre dolduysa doğru cevabı göster
                        const correctOption = this.elements.optionsContainer.querySelector('.option[data-correct="true"]');
                        if (correctOption) {
                            this.isAnswered = true;
                            correctOption.classList.add('selected', 'correct');
                            const questionData = this.questions[this.currentQuestionIndex];
                            const correctOptionIndex = Array.from(this.elements.optionsContainer.children).indexOf(correctOption);
                            const correctOptionData = questionData.options[correctOptionIndex];
                            this.addAIMessage(questionData.correct_explanation || correctOptionData.explanation || 'Doğru cevap budur!', () => {
                                setTimeout(() => this.nextQuestion(), 500);
                            });
                        }
                    }
                }
            }, 1000);
        }
        updateTimerDisplay() {
            const timerValueEl = document.getElementById('quiz-timer-value');
            if (timerValueEl) {
                const min = '00';
                const sec = this.timeLeft < 10 ? '0' + this.timeLeft : this.timeLeft;
                timerValueEl.textContent = `${min}:${sec}`;
            }
        }
        clearTimer() {
            if (this.timer) {
                clearInterval(this.timer);
                this.timer = null;
            }
        }
    }

    // Sayfa yüklendiğinde quiz'i başlat
    // new HeroQuiz(); // This line is now handled by the fetch call
});
