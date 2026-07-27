// Main App Controller
const App = {
    init() {
        this.initDarkMode();
        FirebaseAuth.init();
        this.setupGlobalSearch();
    },

    onAuthReady(isLoggedIn) {
        Sidebar.render();
        Sidebar.renderUser();
        BottomNav.render();
        Topbar.renderUserMenu();
        this.updateNotificationBadges();

        if (!Router.initialized) {
            Router.init();
        }
    },

    initDarkMode() {
        const saved = localStorage.getItem('darkMode');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (saved === 'true' || (!saved && prefersDark)) {
            document.documentElement.classList.add('dark');
        }

        document.getElementById('dark-toggle').addEventListener('click', () => {
            const wasDark = document.documentElement.classList.contains('dark');
            document.documentElement.classList.toggle('dark');
            const isDark = !wasDark;
            localStorage.setItem('darkMode', isDark);
        });
    },

    setupGlobalSearch() {
        const input = document.getElementById('global-search');
        if (!input) return;
        let timer;
        input.addEventListener('input', (e) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                if (e.target.value.trim().length >= 2) {
                    Router.navigate('cari-orang', { query: e.target.value.trim() });
                }
            }, 500);
        });
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                Router.navigate('cari-orang', { query: e.target.value.trim() });
            }
        });
    },

    async updateNotificationBadges() {
        if (!FirebaseAuth.isLoggedIn()) return;
        try {
            const count = await DB.getUnreadCount(FirebaseAuth.currentUser.uid);
            const badges = ['notif-badge', 'sidebar-notif-badge', 'bottom-notif-badge'];
            badges.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    if (count > 0) {
                        el.textContent = count > 99 ? '99+' : count;
                        el.classList.remove('hidden');
                    } else {
                        el.classList.add('hidden');
                    }
                }
            });
        } catch (e) {
            // Silently handle badge update failures
        }
    },

    formatDate(timestamp) {
        if (!timestamp) return '';
        const date = typeof timestamp === 'string' ? new Date(timestamp) : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    },

    formatDateTime(timestamp) {
        if (!timestamp) return '';
        const date = typeof timestamp === 'string' ? new Date(timestamp) : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    },

    timeAgo(timestamp) {
        if (!timestamp) return '';
        const date = typeof timestamp === 'string' ? new Date(timestamp) : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);
        if (diff < 60) return 'Baru saja';
        if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} hari lalu`;
        return App.formatDate(timestamp);
    },

    renderStars(score) {
        const stars = Math.round(score / 20);
        let html = '';
        for (let i = 1; i <= 5; i++) {
            html += i <= stars
                ? '<svg class="w-4 h-4 text-accent-500 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
                : '<svg class="w-4 h-4 text-gray-300 dark:text-gray-600 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        }
        return html;
    },

    getScoreLabel(score) {
        if (score >= 90) return { text: 'Sangat Mirip', class: 'text-green-600 dark:text-green-400' };
        if (score >= 70) return { text: 'Mirip', class: 'text-blue-600 dark:text-blue-400' };
        if (score >= 50) return { text: 'Kemungkinan', class: 'text-yellow-600 dark:text-yellow-400' };
        return { text: 'Perlu Verifikasi', class: 'text-gray-500 dark:text-gray-400' };
    }
};
