// Posting Saya Page
const PostingSayaPage = {
    async render(container) {
        if (!FirebaseAuth.isLoggedIn()) {
            container.innerHTML = `
                <div class="max-w-lg mx-auto text-center py-20">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Login Diperlukan</h2>
                    <p class="text-gray-500 text-sm mb-4">Login untuk melihat posting Anda</p>
                    <button onclick="Router.navigate('login')" class="btn-primary">Login</button>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Posting Saya</h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Kelola semua posting Anda</p>
                    </div>
                    <button onclick="Router.navigate('posting-baru')" class="btn-accent btn-sm flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                        Posting Baru
                    </button>
                </div>
                <div class="flex gap-2 mb-4 flex-wrap">
                    <button onclick="PostingSayaPage.filterStatus('')" class="px-4 py-2 rounded-xl text-xs font-semibold bg-primary-500 text-white">Semua</button>
                    <button onclick="PostingSayaPage.filterStatus('pending')" class="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200">Pending</button>
                    <button onclick="PostingSayaPage.filterStatus('approved')" class="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200">Approved</button>
                    <button onclick="PostingSayaPage.filterStatus('found')" class="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200">Ditemukan</button>
                </div>
                <div id="my-posts" class="space-y-4">${this.renderSkeleton()}</div>
            </div>`;

        this.loadPosts();
    },

    renderSkeleton() {
        return Array(3).fill(`
            <div class="card p-5"><div class="flex items-start gap-4"><div class="w-16 h-16 skeleton rounded-xl"></div><div class="flex-1 space-y-2"><div class="skeleton h-5 w-1/2 rounded"></div><div class="skeleton h-3 w-full rounded"></div><div class="skeleton h-3 w-3/4 rounded"></div></div></div></div>`).join('');
    },

    allMyPosts: [],

    async loadPosts() {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('author_id', FirebaseAuth.currentUser.uid)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Load my posts error:', error);
                document.getElementById('my-posts').innerHTML = `<p class="text-center text-red-400 py-8">Gagal memuat posting: ${escapeHtml(error.message || 'Unknown error')}</p>`;
                return;
            }

            this.allMyPosts = (data || []).map(row => DB.normalizePost(row));
            this.renderPosts(this.allMyPosts);
        } catch (err) {
            document.getElementById('my-posts').innerHTML = '<p class="text-center text-red-400 py-8">Gagal memuat posting</p>';
        }
    },

    filterStatus(status) {
        const filtered = status ? this.allMyPosts.filter(p => p.status === status) : this.allMyPosts;
        this.renderPosts(filtered);
    },

    renderPosts(posts) {
        const container = document.getElementById('my-posts');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Belum ada posting</h3>
                    <button onclick="Router.navigate('posting-baru')" class="btn-accent mt-4">Buat Posting Baru</button>
                </div>`;
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="card hover:shadow-md transition-all">
                <div class="p-5">
                    <div class="flex items-start gap-4">
                        <div class="w-16 h-16 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-xl flex-shrink-0 overflow-hidden">
                            ${post.photoURL ? `<img src="${escapeHtml(post.photoURL)}" class="w-full h-full object-cover">` : escapeHtml((post.fullName || '?')[0]).toUpperCase()}
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center gap-2 flex-wrap">
                                <h3 class="font-bold text-gray-900 dark:text-white">${escapeHtml(post.fullName || '')}</h3>
                                <span class="badge ${post.status === 'approved' ? 'badge-success' : post.status === 'found' ? 'badge-info' : post.status === 'pending' ? 'badge-warning' : 'badge-danger'}">${escapeHtml(post.status)}</span>
                            </div>
                            <p class="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">${escapeHtml(post.description || '')}</p>
                            <p class="text-xs text-gray-400 mt-2">${App.formatDateTime(post.createdAt)}</p>
                        </div>
                        <div class="flex gap-2 flex-shrink-0">
                            <button onclick="Router.navigate('detail-posting', {id:'${post.id}'})" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition" title="Lihat">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                            </button>
                            <button onclick="PostingSayaPage.deletePost('${post.id}')" class="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="Hapus">
                                <svg class="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>`).join('');
    },

    async deletePost(postId) {
        Modal.confirm('Yakin ingin menghapus posting ini?', async () => {
            try {
                await DB.deletePost(postId);
                Toast.show('Posting berhasil dihapus', 'success');
                this.loadPosts();
            } catch (err) {
                Toast.show('Gagal menghapus posting', 'error');
            }
        });
    }
};
