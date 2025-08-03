/**
 * Topic Manager
 * Handles dynamic topic loading based on selected subject
 */

// Topic Manager - Handles dynamic topic loading and selection
export class TopicManager {
    constructor() {
        this.topicOptionsContainer = null;
        this.callbacks = [];
        
        // Predefined topics for each subject
        this.topics = {
            matematik: [
                'Sayılar ve İşlemler',
                'Cebirsel İfadeler',
                'Denklemler',
                'Geometri',
                'Trigonometri',
                'Fonksiyonlar',
                'İstatistik',
                'Olasılık'
            ],
            fizik: [
                'Mekanik',
                'Elektrik',
                'Manyetizma',
                'Optik',
                'Termodinamik',
                'Dalgalar',
                'Atom Fiziği',
                'Nükleer Fizik'
            ],
            kimya: [
                'Maddenin Yapısı',
                'Kimyasal Bağlar',
                'Reaksiyonlar',
                'Çözeltiler',
                'Asitler ve Bazlar',
                'Organik Kimya',
                'Elektrokimya',
                'Termokimya'
            ],
            biyoloji: [
                'Hücre Bilimi',
                'Genetik',
                'Evrim',
                'Ekoloji',
                'İnsan Fizyolojisi',
                'Bitki Biyolojisi',
                'Mikrobiyoloji',
                'Biyoteknoloji'
            ]
        };
    }

    init() {
        this.topicOptionsContainer = document.getElementById('topic-options');
        this.setupEventListeners();
        this.loadDefaultTopics();
    }

    setupEventListeners() {
        // Listen for subject changes
        document.addEventListener('change', (e) => {
            if (e.target.name === 'subject') {
                const subject = e.target.value;
                if (subject && subject !== 'random') {
                    this.loadTopics(subject);
                } else {
                    this.clearTopics();
                }
            }
        });
    }

    loadDefaultTopics() {
        // Load default topics for the first subject (matematik)
        this.loadTopics('matematik');
    }

    loadTopics(subject) {
        if (!this.topicOptionsContainer) return;

        this.clearTopics();
        
        const topics = this.getTopicsForSubject(subject);
        if (topics && topics.length > 0) {
            this.addTopics(topics);
        }
    }

    createTopicOption(topic) {
        const topicOption = document.createElement('div');
        topicOption.className = 'topic-option';
        topicOption.textContent = topic;
        topicOption.dataset.topic = topic;
        
        return topicOption;
    }

    selectTopic(topicElement) {
        // Remove previous selection
        const previousSelected = this.topicOptionsContainer.querySelector('.topic-option.selected');
        if (previousSelected) {
            previousSelected.classList.remove('selected');
        }

        // Add selection to current element
        topicElement.classList.add('selected');

        // Trigger callback
        this.notifyTopicSelected(topicElement.dataset.topic);
    }

    addTopicEventListeners(topicElement) {
        topicElement.addEventListener('click', () => {
            this.selectTopic(topicElement);
        });
    }

    clearTopics() {
        if (this.topicOptionsContainer) {
            this.topicOptionsContainer.innerHTML = '';
        }
    }

    getSelectedTopic() {
        const selectedTopic = this.topicOptionsContainer?.querySelector('.topic-option.selected');
        return selectedTopic ? selectedTopic.dataset.topic : null;
    }

    getTopicsForSubject(subject) {
        return this.topics[subject] || [];
    }

    addTopics(topics) {
        if (!this.topicOptionsContainer) return;

        topics.forEach(topic => {
            const topicOption = this.createTopicOption(topic);
            this.addTopicEventListeners(topicOption);
            this.topicOptionsContainer.appendChild(topicOption);
        });
    }

    removeTopics() {
        this.clearTopics();
    }

    // Callback system for topic selection
    onTopicSelected(callback) {
        this.callbacks.push(callback);
    }

    notifyTopicSelected(topic) {
        this.callbacks.forEach(callback => {
            try {
                callback(topic);
            } catch (error) {
                console.error('Error in topic selection callback:', error);
            }
        });
    }
} 