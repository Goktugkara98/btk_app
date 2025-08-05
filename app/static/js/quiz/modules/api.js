// =============================================================================
// Quiz API Service Module
// =============================================================================

export class QuizApiService {
    constructor(state) {
        this.state = state;
    }

    async fetchAllQuestions() {
        try {
            console.log('📡 Fetching all questions...');
            const response = await fetch(`/api/quiz/session/${this.state.getSessionId()}/questions`);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('📄 API Response:', data);

            if (data.status === 'success') {
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to fetch questions');
            }
        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    }

    async submitAnswer(questionId, answerData) {
        try {
            console.log('📤 Submitting answer...');
            const response = await fetch(`/api/quiz/session/${this.state.getSessionId()}/answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question_id: questionId,
                    user_answer_option_id: answerData
                })
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to submit answer');
            }
        } catch (error) {
            console.error('❌ Submit Answer Error:', error);
            throw error;
        }
    }

    async completeQuiz() {
        try {
            console.log('🏁 Completing quiz...');
            const response = await fetch(`/api/quiz/session/${this.state.getSessionId()}/complete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();
            
            if (data.status === 'success') {
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to complete quiz');
            }
        } catch (error) {
            console.error('❌ Complete Quiz Error:', error);
            throw error;
        }
    }

    async getSessionStatus() {
        try {
            const response = await fetch(`/api/quiz/session/${this.state.getSessionId()}/status`);
            const data = await response.json();
            
            if (data.status === 'success') {
                return data.data;
            } else {
                throw new Error(data.message || 'Failed to get session status');
            }
        } catch (error) {
            console.error('❌ Session Status Error:', error);
            throw error;
        }
    }
} 