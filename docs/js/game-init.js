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
    
    function updateStoreButtons() {
        speedBoostBtn.disabled = window.game.gems < SPEED_BOOST_COST || window.game.speedBoostActive;
        doublePointsBtn.disabled = window.game.gems < DOUBLE_POINTS_COST || window.game.pointMultiplier > 1;
    }
    
    speedBoostBtn.addEventListener('click', () => {
        if (window.game.gems >= SPEED_BOOST_COST && !window.game.speedBoostActive) {
            window.game.gems -= SPEED_BOOST_COST;
            window.game.speedBoostActive = true;
            window.game.speed = Math.max(0.05, window.game.speed - 0.03);
            updateStoreButtons();
        }
    });
    
    doublePointsBtn.addEventListener('click', () => {
        if (window.game.gems >= DOUBLE_POINTS_COST && window.game.pointMultiplier === 1) {
            window.game.gems -= DOUBLE_POINTS_COST;
            window.game.pointMultiplier = 2;
            updateStoreButtons();
        }
    });
}

// Update UI elements
function updateUI() {
    const scoreElement = document.getElementById('score');
    const levelElement = document.getElementById('level');
    const gemsElement = document.getElementById('gems');
    
    scoreElement.textContent = window.game.score;
    levelElement.textContent = window.game.level;
    gemsElement.textContent = window.game.gems;
}

// Event listeners
document.addEventListener('keydown', (e) => {
    if (window.game) {
        window.game.handleInput(e.key.toLowerCase());
    }
});

document.getElementById('restartBtn').addEventListener('click', () => {
    if (window.game) {
        window.game.reset();
        document.getElementById('overlay').classList.add('hidden');
    }
});

document.getElementById('themeToggle').addEventListener('click', () => {
    const isDark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', initGame);
