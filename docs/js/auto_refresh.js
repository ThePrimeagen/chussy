// Auto refresh functionality
(() => {
    let lastActivity = Date.now();
    const REFRESH_DELAY = 120000; // 2 minutes

    function resetTimer() {
        lastActivity = Date.now();
    }

    function checkInactivity() {
        if (Date.now() - lastActivity > REFRESH_DELAY) {
            window.location.reload();
        }
    }

    // Reset timer on any user activity
    document.addEventListener('mousemove', resetTimer);
    document.addEventListener('keydown', resetTimer);
    document.addEventListener('click', resetTimer);

    // Check inactivity every minute
    setInterval(checkInactivity, 60000);
})();
