// Dashboard Page
const DashboardPage = {
    _channel: null,
    _pollTimer: null,
    _realtimeActive: false,

    async render(container) {
        this.cleanup();
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
            this.subscribeRealtime();
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
            <div class="card hover:shadow-lg transition-all duration-300 overflow-hidden">
                ${post.photoURL ? `
                <div onclick="Router.navigate('detail-posting', {id:'${postId}'})" class="h-36 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center cursor-pointer">
                    <img src="${escapeHtml(post.photoURL)}" alt="" class="w-full h-full object-cover">
                </div>` : ''}
                <div class="p-4">
                    <h3 onclick="Router.navigate('detail-posting', {id:'${postId}'})" class="font-bold text-gray-900 dark:text-white text-sm cursor-pointer hover:text-primary-500 transition">${escapeHtml(post.fullName || 'Tidak diketahui')}</h3>
                    ${post.relation ? `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Hubungan: ${escapeHtml(post.relation)}</p>` : ''}
                    <p onclick="Router.navigate('detail-posting', {id:'${postId}'})" class="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2 cursor-pointer">${escapeHtml(post.description || '')}</p>
                    <div class="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <div class="flex items-center gap-2">
                            ${post.city ? `<span class="text-xs text-primary-500 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>${escapeHtml(post.city)}</span>` : ''}
                            ${post.reporterName ? `<span class="text-xs text-gray-400">oleh ${escapeHtml(post.reporterName)}</span>` : ''}
                        </div>
                        <span class="text-xs text-gray-400">${App.timeAgo(post.createdAt)}</span>
                    </div>
                    <div class="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                        <button onclick="event.stopPropagation(); DashboardPage.toggleLike('${postId}', this)" class="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition like-btn" data-liked="false">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                            <span class="like-count">${post.likesCount || 0}</span>
                        </button>
                        <button onclick="event.stopPropagation(); Router.navigate('detail-posting', {id:'${postId}'})" class="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                            <span>${post.commentsCount || 0}</span>
                        </button>
                        <button onclick="event.stopPropagation(); DashboardPage.sharePost('${postId}', '${escapeHtml(post.fullName || '')}')" class="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                            <span>Share</span>
                        </button>
                    </div>
                </div>
            </div>`;
        }).join('');
    },

    async toggleLike(postId, btn) {
        if (!FirebaseAuth.isLoggedIn()) { Toast.show('Login terlebih dahulu', 'warning'); return; }
        const result = await DB.toggleLike(postId);
        const svg = btn.querySelector('svg');
        const countEl = btn.querySelector('.like-count');
        btn.dataset.liked = result.liked;
        svg.setAttribute('fill', result.liked ? 'currentColor' : 'none');
        btn.className = `flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition like-btn ${result.liked ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30'}`;
        if (countEl) countEl.textContent = result.count;
    },

    sharePost(postId, name) {
        const url = window.location.origin + window.location.pathname + '#detail-posting/' + postId;
        if (navigator.share) {
            navigator.share({ title: `RECONNECT - ${name}`, text: `Cari ${name} di RECONNECT`, url });
        } else if (navigator.clipboard) {
            navigator.clipboard.writeText(url);
            Toast.show('Link disalin ke clipboard', 'success');
        }
    },

    subscribeRealtime() {
        this._realtimeActive = false;
        this._channel = supabase
            .channel('dashboard-posts')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
                this._realtimeActive = true;
                this._stopPolling();
                const { eventType, new: newRow, old: oldRow } = payload;

                if (eventType === 'INSERT' && newRow.status === 'approved') {
                    const post = DB.normalizePost(newRow);
                    this.allPosts.unshift(post);
                    this.renderGrid(this.allPosts);
                } else if (eventType === 'UPDATE') {
                    const idx = this.allPosts.findIndex(p => p.id === newRow.id);
                    if (idx !== -1) {
                        if (newRow.status === 'approved') {
                            this.allPosts[idx] = DB.normalizePost(newRow);
                        } else {
                            this.allPosts.splice(idx, 1);
                        }
                        this.renderGrid(this.allPosts);
                    } else if (newRow.status === 'approved') {
                        this.allPosts.unshift(DB.normalizePost(newRow));
                        this.renderGrid(this.allPosts);
                    }
                } else if (eventType === 'DELETE') {
                    const idx = this.allPosts.findIndex(p => p.id === oldRow.id);
                    if (idx !== -1) {
                        this.allPosts.splice(idx, 1);
                        this.renderGrid(this.allPosts);
                    }
                }
            })
            .subscribe();

        // If no realtime event within 8s, fall back to polling
        setTimeout(() => {
            if (!this._realtimeActive && this._channel) {
                console.log('Realtime not active, falling back to polling');
                this._startPolling();
            }
        }, 8000);
    },

    _startPolling() {
        this._stopPolling();
        this._pollTimer = setInterval(async () => {
            if (!document.getElementById('posts-grid')) {
                this._stopPolling();
                return;
            }
            try {
                const { data } = await supabase
                    .from('posts')
                    .select('*')
                    .eq('status', 'approved')
                    .order('created_at', { ascending: false })
                    .limit(20);
                if (data) {
                    this.allPosts = data.map(row => DB.normalizePost(row));
                    this.renderGrid(this.allPosts);
                }
            } catch (e) { /* silent */ }
        }, 30000);
    },

    _stopPolling() {
        if (this._pollTimer) {
            clearInterval(this._pollTimer);
            this._pollTimer = null;
        }
    },

    cleanup() {
        this._stopPolling();
        if (this._channel) {
            supabase.removeChannel(this._channel);
            this._channel = null;
        }
        this._realtimeActive = false;
    }
};
