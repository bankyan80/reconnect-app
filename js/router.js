// Router - Single Page Application
const Router = {
    currentPage: 'dashboard',
    currentParams: {},
    initialized: false,
    pages: {},

    init() {
        this.initialized = true;
        this.registerPages();
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    },

    registerPages() {
        this.pages = {
            'home': DashboardPage,
            'dashboard': DashboardPage,
            'cari-orang': CariOrangPage,
            'posting-baru': PostingBaruPage,
            'ai-search': AISearchPage,
            'ai-chat': AIChatPage,
            'ai-recommendation': AIRecommendationPage,
            'posting-saya': PostingSayaPage,
            'favorit': FavoritPage,
            'notifikasi': NotifikasiPage,
            'riwayat': RiwayatPage,
            'detail-posting': DetailPostingPage,
            'tentang': TentangPage,
            'bantuan': BantuanPage,
            'kontak': KontakPage,
            'moderasi': ModerasiPage,
            'admin': AdminPage,
            'login': LoginPage
        };
    },

    navigate(page, params = {}) {
        this.currentParams = params;
        const hash = params.id ? `${page}/${params.id}` : page;
        window.location.hash = hash;
    },

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'dashboard';
        const parts = hash.split('/');
        let pageName = parts[0];
        const params = {};

        if (parts.length > 1) params.id = parts[1];
        // Only carry over query param if navigating to cari-orang
        if (pageName === 'cari-orang' && this.currentParams.query) {
            params.query = this.currentParams.query;
        }

        if (!this.pages[pageName]) pageName = 'dashboard';

        // Access control
        if (pageName === 'login' && FirebaseAuth.isLoggedIn()) {
            pageName = 'dashboard';
        }
        if (['moderasi'].includes(pageName) && !FirebaseAuth.isModerator()) {
            Toast.show('Akses ditolak', 'error');
            pageName = 'dashboard';
        }
        if (['admin'].includes(pageName) && !FirebaseAuth.isAdmin()) {
            Toast.show('Akses ditolak', 'error');
            pageName = 'dashboard';
        }

        const finalPage = this.pages[pageName];
        if (!finalPage) return;

        const prevPage = this.pages[this.currentPage];
        if (prevPage && typeof prevPage.cleanup === 'function' && prevPage !== finalPage) {
            prevPage.cleanup();
        }

        this.currentPage = pageName;
        const content = document.getElementById('page-content');

        content.innerHTML = '';
        content.className = 'flex-1 overflow-y-auto p-4 lg:p-6 page-enter';

        try {
            if (typeof finalPage.render === 'function') {
                finalPage.render(content, params);
            }
        } catch (err) {
            console.error('Page render error:', err);
            content.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-center">
                    <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                        <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                    </div>
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Terjadi Kesalahan</h2>
                    <p class="text-gray-500 dark:text-gray-400 text-sm">${escapeHtml(err.message)}</p>
                    <button onclick="Router.navigate('dashboard')" class="btn-primary mt-4">Kembali ke Dashboard</button>
                </div>`;
        }

        // Update UI
        Sidebar.render();
        Sidebar.renderUser();
        BottomNav.render();
        Topbar.renderUserMenu();
        window.scrollTo(0, 0);
    },

    back() {
        window.history.back();
    }
};
