// Auto-refresh functionality for inactive sessions
(function() {
    let lastActivityTime = Date.now();
    const TIMEOUT = 30000; // 30 seconds

    function checkInactivity() {
        if (Date.now() - lastActivityTime >= TIMEOUT) {
            window.location.reload();
        }
    }

    function updateLastActivity() {
        lastActivityTime = Date.now();
    }

    // Monitor user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
        document.addEventListener(event, updateLastActivity, true);
    });

    // Check inactivity every second
    setInterval(checkInactivity, 1000);

    // Initial activity timestamp
    updateLastActivity();
})();
