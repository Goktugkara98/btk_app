// =============================================================================
// Quiz UI Manager Module
// =============================================================================

export class QuizUIManager {
    constructor(state) {
        this.state = state;
        this.elements = this.initializeElements();
    }

    initializeElements() {
        this.elements = {
            questionContainer: document.getElementById('question-container'),
            questionText: document.getElementById('question-text'),
            optionsContainer: document.getElementById('options-container'),
            loadingState: document.getElementById('loading-state'),
            errorState: document.getElementById('error-state'),
            prevButton: document.getElementById('prev-button'),
            nextButton: document.getElementById('next-button'),
            subjectName: document.getElementById('subject-name'),
            topicName: document.getElementById('topic-name'),
            difficultyBadge: document.getElementById('difficulty-badge'),
            currentQuestionNumber: document.getElementById('current-question-number'),
            totalQuestionNumber: document.getElementById('total-question-number'),
            timer: document.getElementById('timer'),
            quizMode: document.getElementById('quiz-mode'),
            retryButton: document.getElementById('retry-button'),
            questionNavList: document.getElementById('question-nav-list')
        };
    }

    // State visibility methods
    showLoading() {
        console.log('⏳ showLoading called');
        
        // Hide other state elements
        if (this.elements.errorState) {
            this.elements.errorState.style.display = 'none';
        }
        
        // Show loading state
        if (this.elements.loadingState) {
            console.log('⏳ Setting loading state to display: block');
            this.elements.loadingState.style.display = 'block';
        }
        
        console.log('✅ showLoading completed');
    }

    showQuestion() {
        console.log('👁️ showQuestion called');
        
        // Hide loading state
        if (this.elements.loadingState) {
            console.log('🔄 Setting loading state to display: none');
            this.elements.loadingState.style.display = 'none';
        }
        
        // Show question container
        if (this.elements.questionContainer) {
            console.log('📦 Setting question container to display: block');
            this.elements.questionContainer.style.display = 'block';
            console.log('📦 Question container display style:', this.elements.questionContainer.style.display);
        } else {
            console.error('❌ Question container element not found');
        }
        
        console.log('✅ showQuestion completed');
    }

    showCompleted() {
        this.hideAllStates();
        // The completed state is handled by the quiz controller, not the UI manager.
        // We just need to ensure the question container is hidden.
        if (this.elements.questionContainer) {
            this.elements.questionContainer.style.display = 'none';
        }
    }

    showError() {
        this.hideAllStates();
        if (this.elements.errorState) {
            this.elements.errorState.style.display = 'block';
        }
    }

    hideAllStates() {
        console.log('🚫 hideAllStates called');
        
        // Only hide state elements, not UI elements
        const stateElements = [
            this.elements.loadingState,
            this.elements.errorState
        ];
        
        stateElements.forEach(element => {
            if (element && element.style) {
                console.log('🚫 Hiding state element:', element.id || element.className);
                element.style.display = 'none';
            }
        });
        
        console.log('✅ hideAllStates completed');
    }

    // Question display methods
    displayQuestion(questionData) {
        console.log('🔍 displayQuestion called with:', questionData);
        
        const { question, question_number, total_questions, user_answer_option_id } = questionData;
        
        // Set question text
        if (this.elements.questionText) {
            this.elements.questionText.textContent = question.text;
            console.log('📝 Setting question text:', question.text);
        }
        
        // Update navbar with current question's information
        if (question.subject_name) {
            console.log('📚 Updating navbar subject to:', question.subject_name);
            this.updateSubject(question.subject_name);
        }
        if (question.topic_name) {
            console.log('📖 Updating navbar topic to:', question.topic_name);
            this.updateTopic(question.topic_name);
        }
        if (question.difficulty_level) {
            console.log('🎯 Updating navbar difficulty to:', question.difficulty_level);
            this.updateDifficulty(question.difficulty_level);
        }
        
        // Clear options container
        if (this.elements.optionsContainer) {
            console.log('🗑️ Clearing options container');
            this.elements.optionsContainer.innerHTML = '';
        }
        
        // Create options
        if (question.options && Array.isArray(question.options)) {
            console.log('📋 Creating options:', question.options);
            question.options.forEach((option, index) => {
                const optionElement = this.createOptionElement(option, index);
                if (this.elements.optionsContainer) {
                    this.elements.optionsContainer.appendChild(optionElement);
                }
            });
        }
        
        console.log('✅ Question display completed');
    }

    createOptionElement(option, index) {
        console.log(`🔧 Creating option ${index}:`, option);
        
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option-item';
        optionDiv.dataset.option = index;
        
        const letter = String.fromCharCode(65 + index); // A, B, C, D...
        
        optionDiv.innerHTML = `
            <div class="option-content">
                <span class="option-letter">${letter}</span>
                <span class="option-text">${option.name}</span>
            </div>
        `;
        
        console.log(`✅ Created option element:`, optionDiv);
        return optionDiv;
    }

    // Navigation methods
    updateNavigation(currentQuestion) {
        console.log('🧭 Navigation updated:', {
            current: currentQuestion.question_number,
            total: currentQuestion.total_questions,
            answered: currentQuestion.user_answer_option_id !== null
        });

        // Update topbar elements
        if (this.elements.currentQuestionNumber) {
            this.elements.currentQuestionNumber.textContent = currentQuestion.question_number;
        }
        if (this.elements.totalQuestionNumber) {
            this.elements.totalQuestionNumber.textContent = currentQuestion.total_questions;
        }

        // Update question navigation
        const answeredQuestions = this.getAnsweredQuestions();
        this.updateQuestionNavigation(currentQuestion.question_number, answeredQuestions);
    }

    // Update timer display
    updateTimer(seconds) {
        console.log('⏰ updateTimer called with:', seconds);
        if (this.elements.timer) {
            let displayText;
            if (seconds === null || seconds === undefined) {
                displayText = 'Süre Yok';
            } else {
                displayText = this.formatTime(seconds);
            }
            console.log('⏰ Setting timer to:', displayText);
            this.elements.timer.textContent = displayText;
        } else {
            console.warn('⚠️ Timer element not found');
        }
    }

    // Update difficulty badge
    updateDifficulty(difficulty) {
        console.log('🎯 updateDifficulty called with:', difficulty);
        if (this.elements.difficultyBadge) {
            const difficultyMap = {
                'easy': 'Kolay',
                'medium': 'Orta',
                'hard': 'Zor',
                'kolay': 'Kolay',
                'orta': 'Orta',
                'zor': 'Zor'
            };
            const displayDifficulty = difficultyMap[difficulty] || difficulty;
            console.log('🎯 Setting difficulty to:', displayDifficulty);
            this.elements.difficultyBadge.textContent = displayDifficulty;
        } else {
            console.warn('⚠️ Difficulty badge element not found');
        }
    }

    // Update subject name
    updateSubject(subject) {
        console.log('📚 updateSubject called with:', subject);
        if (this.elements.subjectName) {
            console.log('📚 Setting subject to:', subject);
            this.elements.subjectName.textContent = subject;
        } else {
            console.warn('⚠️ Subject name element not found');
        }
    }

    // Update topic name
    updateTopic(topic) {
        console.log('📖 updateTopic called with:', topic);
        if (this.elements.topicName) {
            console.log('📖 Setting topic to:', topic);
            this.elements.topicName.textContent = topic;
        } else {
            console.warn('⚠️ Topic name element not found');
        }
    }

    getAnsweredQuestions() {
        // Get answered questions from state
        const allQuestions = this.state.getAllQuestions();
        const answeredQuestions = [];
        
        allQuestions.forEach((question, index) => {
            if (question.user_answer_option_id !== null) {
                answeredQuestions.push(index + 1);
            }
        });
        
        return answeredQuestions;
    }

    // Progress methods
    updateProgress(percentage) {
        // Progress bar was removed from question container
        // Progress is now only shown in the topbar
        console.log('📊 Progress updated:', percentage + '%');
    }

    // Answer selection methods
    updateAnswerUI(selectedOptionId) {
        // Remove previous selections
        document.querySelectorAll('.option-item').forEach(option => {
            option.classList.remove('selected');
        });

        // Mark selected answer
        const selectedOption = document.querySelector(`[data-option="${selectedOptionId}"]`);
        if (selectedOption) {
            selectedOption.classList.add('selected');
            console.log(`✅ Marked option ${selectedOptionId} as selected`);
        }
    }

    // Results methods
    displayResults(results) {
        console.log('🏆 Displaying results:', results);
        
        // The results display is handled by the quiz controller, not the UI manager.
        // if (this.elements.correctAnswers) {
        //     this.elements.correctAnswers.textContent = results.correct_answers;
        // }
        // if (this.elements.totalQuestionsFinal) {
        //     this.elements.totalQuestionsFinal.textContent = results.total_questions;
        // }
        // if (this.elements.successRate) {
        //     this.elements.successRate.textContent = `${results.percentage}%`;
        // }
        // if (this.elements.timeTaken) {
        //     this.elements.timeTaken.textContent = this.formatTime(results.completion_time_seconds);
        // }
        
        this.showCompleted();
    }

    // Error methods
    displayError(message) {
        console.error('❌ Error:', message);
        if (this.elements.errorMessage) {
            this.elements.errorMessage.textContent = message;
        }
        this.showError();
    }

    // Utility methods
    formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    createQuestionNavigation(totalQuestions) {
        console.log('🔗 Creating question navigation for', totalQuestions, 'questions');
        
        if (!this.elements.questionNavList) {
            console.warn('⚠️ Question nav list element not found');
            return;
        }

        this.elements.questionNavList.innerHTML = '';
        
        for (let i = 1; i <= totalQuestions; i++) {
            const navItem = document.createElement('a');
            navItem.href = '#';
            navItem.className = 'question-nav-item';
            navItem.dataset.questionNumber = i;
            navItem.textContent = i;
            
            // Add click event
            navItem.addEventListener('click', (e) => {
                e.preventDefault();
                this.onQuestionNavClick(i);
            });
            
            this.elements.questionNavList.appendChild(navItem);
        }
        
        console.log('✅ Question navigation created with', totalQuestions, 'items');
    }

    updateQuestionNavigation(currentQuestionNumber, answeredQuestions = []) {
        console.log('🧭 Updating question navigation:', { current: currentQuestionNumber, answered: answeredQuestions });
        
        if (!this.elements.questionNavList) {
            console.warn('⚠️ Question nav list element not found');
            return;
        }

        const navItems = this.elements.questionNavList.querySelectorAll('.question-nav-item');
        
        navItems.forEach((item, index) => {
            const questionNumber = index + 1;
            
            // Remove all classes first
            item.classList.remove('current', 'answered');
            
            // Add current class
            if (questionNumber === currentQuestionNumber) {
                item.classList.add('current');
            }
            
            // Add answered class
            if (answeredQuestions.includes(questionNumber)) {
                item.classList.add('answered');
            }
        });
        
        console.log('✅ Question navigation updated');
    }

    onQuestionNavClick(questionNumber) {
        console.log('🎯 Question navigation clicked:', questionNumber);
        
        // Dispatch custom event for controller to handle
        const event = new CustomEvent('questionNavClick', {
            detail: { questionNumber }
        });
        document.dispatchEvent(event);
    }
} 