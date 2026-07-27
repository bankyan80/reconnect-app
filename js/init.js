// App Initialization
document.addEventListener('DOMContentLoaded', () => {
    App.init();

    const menuToggle = document.getElementById('menu-toggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch((err) => {
            console.warn('SW registration failed:', err);
        });
    }
});
