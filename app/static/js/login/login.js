// Login Page - Fresh JavaScript with Dynamic Scenarios

document.addEventListener('DOMContentLoaded', () => {
    // Login form handling
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Load and play sequential scenario
    loadSequentialScenario();
});

// Login form handler
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Basic validation
    if (!email || !password) {
        alert('Lütfen tüm alanları doldurun.');
        return;
    }
    
    // Here you would typically send the data to your backend
    console.log('Login attempt:', { email, password });
    
    // For demo purposes, show success message
    alert('Giriş başarılı! (Demo)');
}

// Global variable for scenarios data
let scenariosData = null;
let currentScenarioIndex = 0;

// Load only science scenario (photosynthesis)
async function loadSequentialScenario() {
    try {
        // Load scenarios data only once
        if (!scenariosData) {
            const response = await fetch('/static/js/login/scenarios.json');
            scenariosData = await response.json();
        }
        
        // Get current scenario
        const scenario = scenariosData.scenarios[currentScenarioIndex];
        
        // Load scenario into UI
        loadScenarioToUI(scenario);
        
        // Start playing the scenario
        playScenario(scenario, onScenarioEnd);
        
    } catch (error) {
        console.error('Error loading scenarios:', error);
        // Fallback to default scenario
        loadDefaultScenario();
    }
}

function onScenarioEnd() {
    // Bir sonraki senaryoya geç
    currentScenarioIndex = (currentScenarioIndex + 1) % scenariosData.scenarios.length;
    setTimeout(loadSequentialScenario, 1000); // 1 saniye bekle
}

// Load scenario data into UI
function loadScenarioToUI(scenario) {
    console.log('Loading scenario:', scenario); // Debug log
    
    // Update question
    const questionElement = document.getElementById('demo-question');
    if (questionElement) {
        questionElement.textContent = scenario.question;
        console.log('Updated question:', scenario.question); // Debug log
    } else {
        console.error('Question element not found!'); // Debug log
    }
    
    // Update subject and difficulty
    const subjectElement = document.querySelector('.quiz-meta .subject');
    const difficultyElement = document.querySelector('.quiz-meta .difficulty');
    if (subjectElement) {
        subjectElement.textContent = scenario.subject;
        console.log('Updated subject:', scenario.subject); // Debug log
    }
    if (difficultyElement) {
        difficultyElement.textContent = scenario.difficulty;
        console.log('Updated difficulty:', scenario.difficulty); // Debug log
    }
    
    // Update options
    const optionsContainer = document.getElementById('demo-options');
    if (optionsContainer) {
        optionsContainer.innerHTML = '';
        scenario.options.forEach(option => {
            const optionElement = document.createElement('div');
            optionElement.className = 'option';
            optionElement.setAttribute('data-correct', option.correct ? 'true' : 'false');
            optionElement.innerHTML = `
                <span class="option-letter">${option.letter}</span>
                <span class="option-text">${option.text}</span>
            `;
            optionsContainer.appendChild(optionElement);
        });
        console.log('Updated options:', scenario.options); // Debug log
    } else {
        console.error('Options container not found!'); // Debug log
    }
}

// Play scenario steps sequentially, çağrı değişti
function playScenario(scenario, onComplete) {
    const options = document.querySelectorAll('.option');
    const chatMessages = document.getElementById('chat-messages');
    
    // Disable manual clicking
    options.forEach(option => {
        option.style.pointerEvents = 'none';
    });
    
    // Clear chat
    chatMessages.innerHTML = '';
    
    // Play scenario steps sequentially
    let step = 0;
    function playNextStep() {
        if (step < scenario.steps.length) {
            const currentStep = scenario.steps[step];
            setTimeout(() => {
                executeStep(currentStep, () => {
                    // Callback when step is complete
                    step++;
                    playNextStep();
                });
            }, currentStep.delay);
        } else {
            // Senaryo bittiğinde onComplete çağır
            if (onComplete) onComplete();
        }
    }
    playNextStep();
}

// Execute a single step
function executeStep(step, callback) {
    switch (step.type) {
        case 'ai':
            addChatMessage(step.message, 'ai', callback);
            break;
        case 'user':
            addChatMessage(step.message, 'user', callback);
            break;
        case 'select':
            selectOption(step.option);
            // For select, add a small delay for visual feedback
            if (callback) setTimeout(callback, 300);
            break;
    }
}

// Select option with visual feedback
function selectOption(letter) {
    const options = document.querySelectorAll('.option');
    const selectedOption = Array.from(options).find(option => 
        option.querySelector('.option-letter').textContent === letter
    );
    
    if (selectedOption) {
        // Clear previous selections
        options.forEach(opt => {
            opt.classList.remove('selected', 'correct', 'incorrect');
        });
        
        // Mark selected option
        selectedOption.classList.add('selected');
        
        const isCorrect = selectedOption.getAttribute('data-correct') === 'true';
        
        if (isCorrect) {
            selectedOption.classList.add('correct');
        } else {
            selectedOption.classList.add('incorrect');
        }
    }
}

// Add chat message with typing effect
function addChatMessage(text, type = 'ai', callback = null) {
    const chatMessages = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}-message`;
    
    if (type === 'ai') {
        // AI message with typing effect
        messageDiv.innerHTML = '<p></p>';
        chatMessages.appendChild(messageDiv);
        
        const p = messageDiv.querySelector('p');
        
        // Split text into lines for better control
        const lines = text.split('\n');
        let currentLine = 0;
        let currentChar = 0;
        let displayText = '';
        
        const typeWriter = () => {
            if (currentLine < lines.length) {
                const line = lines[currentLine];
                
                if (currentChar < line.length) {
                    // Add character to current line
                    displayText += line.charAt(currentChar);
                    currentChar++;
                } else {
                    // Move to next line
                    displayText += '\n';
                    currentLine++;
                    currentChar = 0;
                }
                
                // Update display with proper line breaks
                p.innerHTML = displayText.replace(/\n/g, '<br>');
                
                // Force scroll to bottom
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // Continue typing
                setTimeout(typeWriter, 30);
            } else {
                // Final scroll after typing is complete
                chatMessages.scrollTop = chatMessages.scrollHeight;
                
                // Call callback when typing is complete
                if (callback) {
                    setTimeout(callback, 100); // Small delay before next message
                }
            }
        };
        typeWriter();
    } else {
        // User message (instant)
        messageDiv.innerHTML = `<p>${text}</p>`;
        chatMessages.appendChild(messageDiv);
        // Force scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Call callback immediately for user messages
        if (callback) {
            setTimeout(callback, 100); // Small delay before next message
        }
    }
    
    // Additional scroll after a short delay to ensure it works
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 100);
}

// Fallback default scenario
function loadDefaultScenario() {
    const defaultScenario = {
        question: "Aşağıdaki sayılardan hangisi en büyüktür?",
        subject: "Matematik",
        difficulty: "Orta",
        options: [
            { letter: "A", text: "1250", correct: true },
            { letter: "B", text: "999", correct: false },
            { letter: "C", text: "850", correct: false },
            { letter: "D", text: "750", correct: false }
        ],
        steps: [
            { delay: 1000, type: "ai", message: "Merhaba! Bu soruyu birlikte çözelim." },
            { delay: 2000, type: "select", option: "B" },
            { delay: 1000, type: "user", message: "B seçeneğini seçtin." },
            { delay: 1500, type: "ai", message: "Yanlış cevap. Tekrar deneyelim!" },
            { delay: 1500, type: "select", option: "A" },
            { delay: 1000, type: "user", message: "A seçeneğini seçtin." },
            { delay: 1500, type: "ai", message: "Mükemmel! Doğru cevap." }
        ]
    };
    
    loadScenarioToUI(defaultScenario);
    setTimeout(() => playScenario(defaultScenario), 500);
} 