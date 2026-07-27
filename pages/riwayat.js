// Riwayat Page
const RiwayatPage = {
    async render(container) {
        if (!FirebaseAuth.isLoggedIn()) {
            container.innerHTML = `
                <div class="max-w-lg mx-auto text-center py-20">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Login Diperlukan</h2>
                    <button onclick="Router.navigate('login')" class="btn-primary">Login</button>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Riwayat</h1>
                <div id="history-list" class="space-y-3">
                    <div class="skeleton h-20 w-full rounded-2xl"></div>
                    <div class="skeleton h-20 w-full rounded-2xl"></div>
                    <div class="skeleton h-20 w-full rounded-2xl"></div>
                </div>
            </div>`;

        this.loadHistory();
    },

    async loadHistory() {
        try {
            const { data, error } = await supabase
                .from('ai_search_logs')
                .select('*')
                .eq('user_id', FirebaseAuth.currentUser.uid)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Load history error:', error);
                document.getElementById('history-list').innerHTML = `<p class="text-center text-red-400 py-8">Gagal memuat riwayat: ${escapeHtml(error.message || 'Unknown')}</p>`;
                return;
            }

            const history = (data || []).map(h => ({
                ...h,
                createdAt: h.created_at,
                resultCount: h.result_count
            }));
            const container = document.getElementById('history-list');
            if (!container) return;

            if (history.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Belum ada riwayat</h3>
                        <p class="text-sm text-gray-400 mt-1">Riwayat pencarian AI Anda akan muncul di sini</p>
                    </div>`;
                return;
            }

            container.innerHTML = history.map(h => `
                <div class="card p-4 hover:shadow-md transition-all cursor-pointer" onclick="Router.navigate('ai-search')">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="font-medium text-gray-900 dark:text-white text-sm">${escapeHtml(h.query || 'Pencarian')}</p>
                            <p class="text-xs text-gray-400">${h.resultCount || 0} hasil ditemukan</p>
                        </div>
                        <span class="text-xs text-gray-400">${App.timeAgo(h.createdAt)}</span>
                    </div>
                </div>`).join('');
        } catch (err) {
            document.getElementById('history-list').innerHTML = '<p class="text-center text-red-400 py-8">Gagal memuat riwayat</p>';
        }
    }
};
