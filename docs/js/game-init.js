// Game initialization and UI management
async function initGame() {
    try {
        // Get canvas element
        const canvas = document.getElementById('gameCanvas');
        
        // Initialize 3D game
        window.game = new Snake3D(canvas);
        await window.game.init();
        
        // Setup store functionality
        setupStore();
        
        // Start game
        updateUI();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        const overlay = document.getElementById('overlay');
        const message = document.createElement('div');
        message.textContent = 'Failed to load game. Please refresh the page.';
        message.classList.add('text-red-500', 'text-xl', 'font-bold');
        overlay.querySelector('.text-center').prepend(message);
        overlay.classList.remove('hidden');
    }
}

// Store functionality
function setupStore() {
    const speedBoostBtn = document.getElementById('speedBoostBtn');
    const doublePointsBtn = document.getElementById('doublePointsBtn');
    
    if (!speedBoostBtn || !doublePointsBtn) {
        console.error('Store buttons not found');
        return;
    }
    
    function updateStoreButtons() {
        if (!window.game) return;
        speedBoostBtn.disabled = window.game.gems < SPEED_BOOST_COST || window.game.speedBoostActive;
        doublePointsBtn.disabled = window.game.gems < DOUBLE_POINTS_COST || window.game.pointMultiplier > 1;
    }
    
    speedBoostBtn.addEventListener('click', () => {
        if (!window.game) return;
        if (window.game.gems >= SPEED_BOOST_COST && !window.game.speedBoostActive) {
            window.game.gems -= SPEED_BOOST_COST;
            window.game.speedBoostActive = true;
            window.game.speed = Math.max(0.05, window.game.speed - 0.03);
            updateStoreButtons();
        }
    });
    
    doublePointsBtn.addEventListener('click', () => {
        if (!window.game) return;
        if (window.game.gems >= DOUBLE_POINTS_COST && window.game.pointMultiplier === 1) {
            window.game.gems -= DOUBLE_POINTS_COST;
            window.game.pointMultiplier = 2;
            updateStoreButtons();
        }
    });
}

// Update UI elements
function updateUI() {
    if (!window.game) return;
    
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const gemsElement = document.getElementById('gems');
    
    if (scoreElement) scoreElement.textContent = window.game.score;
    if (levelElement) levelElement.textContent = window.game.level;
    if (gemsElement) gemsElement.textContent = window.game.gems;
}

// Event listeners
function setupEventListeners() {
    try {
        // Theme toggle - always keep dark mode
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                try {
                    // Force dark mode
                    document.documentElement.classList.add('dark');
                    localStorage.setItem('theme', 'dark');
                } catch (error) {
                    console.error('Failed to set theme:', error);
                }
            });
        }

        // Game controls
        const handleKeydown = (e) => {
            try {
                if (window.game && typeof window.game.handleInput === 'function') {
                    window.game.handleInput(e.key.toLowerCase());
                }
            } catch (error) {
                console.error('Failed to handle input:', error);
            }
        };
        document.removeEventListener('keydown', handleKeydown); // Remove any existing listeners
        document.addEventListener('keydown', handleKeydown);

        // Restart button
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.addEventListener('click', () => {
                try {
                    if (window.game && typeof window.game.reset === 'function') {
                        window.game.reset();
                        const overlay = document.getElementById('overlay');
                        if (overlay) {
                            overlay.classList.add('hidden');
                        }
                    }
                } catch (error) {
                    console.error('Failed to restart game:', error);
                }
            });
        }
    } catch (error) {
        console.error('Failed to setup event listeners:', error);
    }
}

// Constants
const SPEED_BOOST_COST = 100;
const DOUBLE_POINTS_COST = 200;
const DIRECTION_CHANGE_DELAY = 50;

// Initialize game when all scripts are loaded
async function initializeGame() {
    try {
        if (typeof Snake3D === 'undefined') {
            throw new Error('Snake3D not loaded. Please check script loading order.');
        }
        
        // Get canvas element
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Game canvas not found');
        }
        
        // Initialize 3D game
        window.game = new Snake3D(canvas);
        await window.game.init();
        
        // Setup game functionality
        setupStore();
        setupEventListeners();
        
        // Start game
        updateUI();
    } catch (error) {
        console.error('Failed to initialize game:', error);
        const overlay = document.getElementById('overlay');
        if (overlay) {
            const message = document.createElement('div');
            message.textContent = 'Failed to load game. Please refresh the page.';
            message.classList.add('text-red-500', 'text-xl', 'font-bold');
            const center = overlay.querySelector('.text-center');
            if (center) {
                center.prepend(message);
                overlay.classList.remove('hidden');
            }
        }
    }
}

// Try to initialize multiple times in case scripts are still loading
let attempts = 0;
const maxAttempts = 5;
const attemptInterval = 200;

function tryInitialize() {
    if (attempts >= maxAttempts) {
        console.error('Failed to initialize game after multiple attempts');
        return;
    }
    
    if (typeof Snake3D === 'undefined') {
        attempts++;
        setTimeout(tryInitialize, attemptInterval);
    } else {
        initializeGame();
    }
}

// Initialize when DOM is loaded
function initializeOnLoad() {
    try {
        const canvas = document.getElementById('gameCanvas');
        const clockElement = document.getElementById('clock');
        
        if (canvas) {
            canvas.classList.remove('hidden');
            tryInitialize();
        } else {
            console.error('Required game elements not found');
        }
        
        if (clockElement) {
            clockElement.addEventListener('click', (event) => {
                try {
                    event.preventDefault();
                    const now = new Date();
                    clockElement.textContent = now.toLocaleTimeString();
                } catch (error) {
                    console.error('Failed to update clock:', error);
                }
            });
        }
    } catch (error) {
        console.error('Failed to initialize game:', error);
        const overlay = document.getElementById('overlay');
        if (overlay) {
            const message = document.createElement('div');
            message.textContent = 'Failed to load game. Please refresh the page.';
            message.classList.add('text-red-500', 'text-xl', 'font-bold');
            const center = overlay.querySelector('.text-center');
            if (center) {
                center.prepend(message);
                overlay.classList.remove('hidden');
            }
        }
    }
}

// Add event listener with error handling
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', (event) => {
        try {
            initializeOnLoad();
        } catch (error) {
            console.error('Failed to initialize on DOM content loaded:', error);
        }
    });
} else {
    try {
        initializeOnLoad();
    } catch (error) {
        console.error('Failed to initialize:', error);
    }
}
