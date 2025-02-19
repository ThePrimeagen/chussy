// Auto-refresh functionality with sexy countdown
(function() {
    let lastActivityTime = Date.now();
    const TIMEOUT = 30000; // 30 seconds
    const COUNTDOWN_START = 5000; // Start countdown at 5 seconds

    // Create countdown element
    const countdownEl = document.createElement('div');
    countdownEl.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: rgba(147, 51, 234, 0.9);
        color: white;
        padding: 10px 20px;
        border-radius: 20px;
        font-size: 18px;
        font-weight: bold;
        opacity: 0;
        transition: opacity 0.3s ease;
        z-index: 9999;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        backdrop-filter: blur(5px);
    `;
    document.body.appendChild(countdownEl);

    function checkInactivity() {
        const timeSinceActivity = Date.now() - lastActivityTime;
        
        if (timeSinceActivity >= TIMEOUT) {
            window.location.reload();
        } else if (timeSinceActivity >= TIMEOUT - COUNTDOWN_START) {
            const remainingSeconds = Math.ceil((TIMEOUT - timeSinceActivity) / 1000);
            countdownEl.textContent = `Refreshing in ${remainingSeconds}s`;
            countdownEl.style.opacity = '1';
            
            // Add pulse animation when countdown is low
            if (remainingSeconds <= 3) {
                countdownEl.style.animation = 'pulse 1s infinite';
            }
        } else {
            countdownEl.style.opacity = '0';
            countdownEl.style.animation = 'none';
        }
    }

    function updateLastActivity() {
        lastActivityTime = Date.now();
        countdownEl.style.opacity = '0';
        countdownEl.style.animation = 'none';
    }

    // Add pulse animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);

    // Monitor user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, updateLastActivity, true);
    });

    // Check inactivity every 100ms for smooth countdown
    setInterval(checkInactivity, 100);

    // Initial activity timestamp
    updateLastActivity();
})();
