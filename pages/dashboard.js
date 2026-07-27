// Dashboard Page
const DashboardPage = {
    async render(container) {
        container.innerHTML = `
            <div class="max-w-7xl mx-auto space-y-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-500 dark:text-gray-400">Selamat datang di RECONNECT</p>
                    </div>
                    <div class="flex gap-2">
                        <button onclick="Router.navigate('ai-search')" class="btn-accent btn-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        </button>
                        <button onclick="Router.navigate('posting-baru')" class="btn-primary btn-sm">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        </button>
                    </div>
                </div>

                <div id="posts-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div class="col-span-full text-center py-12">
                        <div class="inline-block w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                        <p class="text-sm text-gray-400 mt-3">Memuat postingan...</p>
                    </div>
                </div>
            </div>`;

        this.loadPosts();
    },

    allPosts: [],

    async loadPosts() {
        const grid = document.getElementById('posts-grid');
        if (!grid) return;

        grid.innerHTML = `
            <div class="col-span-full text-center py-12">
                <div class="inline-block w-8 h-8 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-sm text-gray-400 mt-3">Memuat postingan...</p>
            </div>`;

        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(20);

            if (error) {
                console.error('Dashboard load error:', error);
                grid.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <svg class="w-16 h-16 mx-auto text-red-300 dark:text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Gagal memuat data</h3>
                        <p class="text-sm text-gray-400 mt-1">${escapeHtml(error.message || 'Terjadi kesalahan')}</p>
                        <button onclick="DashboardPage.loadPosts()" class="btn-primary mt-4">Coba Lagi</button>
                    </div>`;
                return;
            }

            this.allPosts = (data || []).map(row => DB.normalizePost(row));
            this.renderGrid(this.allPosts);
        } catch (err) {
            console.error('Dashboard error:', err);
            grid.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <svg class="w-16 h-16 mx-auto text-red-300 dark:text-red-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Gagal memuat data</h3>
                    <p class="text-sm text-gray-400 mt-1">${escapeHtml(err.message)}</p>
                    <button onclick="DashboardPage.loadPosts()" class="btn-primary mt-4">Coba Lagi</button>
                </div>`;
        }
    },

    renderGrid(posts) {
        const container = document.getElementById('posts-grid');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="col-span-full text-center py-12">
                    <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Belum ada posting</h3>
                    <p class="text-sm text-gray-400 mt-1">Mulai membuat posting untuk menemukan orang yang Anda cari</p>
                    <button onclick="Router.navigate('posting-baru')" class="btn-primary mt-4">Buat Posting Baru</button>
                </div>`;
            return;
        }

        container.innerHTML = posts.map(post => {
            const postId = escapeHtml(post.id);
            return `
            <div onclick="Router.navigate('detail-posting', {id:'${postId}'})" class="card hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                <div class="h-36 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                    ${post.photoURL
                        ? `<img src="${escapeHtml(post.photoURL)}" alt="" class="w-full h-full object-cover">`
                        : `<span class="text-4xl font-bold text-white/80">${escapeHtml((post.fullName || '?')[0]).toUpperCase()}</span>`
                    }
                </div>
                <div class="p-4">
                    <h3 class="font-bold text-gray-900 dark:text-white text-sm">${escapeHtml(post.fullName || 'Tidak diketahui')}</h3>
                    ${post.relation ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Hubungan: ${escapeHtml(post.relation)}</p>` : ''}
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2">${escapeHtml(post.description || '')}</p>
                    <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-2">
                            ${post.city ? `<span class="text-xs text-primary-500 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>${escapeHtml(post.city)}</span>` : ''}
                            ${post.reporterName ? `<span class="text-xs text-gray-400">oleh ${escapeHtml(post.reporterName)}</span>` : ''}
                        </div>
                        <span class="text-xs text-gray-400">${App.timeAgo(post.createdAt)}</span>
                    </div>
                </div>
            </div>`;
        }).join('');
    }
};
