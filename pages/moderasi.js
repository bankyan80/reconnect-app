// Moderasi Page
const ModerasiPage = {
    async render(container) {
        if (!FirebaseAuth.isModerator()) {
            container.innerHTML = '<p class="text-center text-gray-400 py-12">Akses ditolak</p>';
            return;
        }

        container.innerHTML = `
            <div class="max-w-5xl mx-auto space-y-6">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Moderasi</h1>
                <div class="flex gap-2 mb-4 flex-wrap">
                    <button onclick="ModerasiPage.filterTab('pending')" class="tab-btn active px-4 py-2 rounded-xl text-xs font-semibold" data-tab="pending">Menunggu</button>
                    <button onclick="ModerasiPage.filterTab('reports')" class="tab-btn px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300" data-tab="reports">Laporan</button>
                </div>
                <div id="moderation-list" class="space-y-4">
                    <div class="skeleton h-24 w-full rounded-2xl"></div>
                    <div class="skeleton h-24 w-full rounded-2xl"></div>
                </div>
            </div>`;

        this.loadPending();
    },

    filterTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.className = 'tab-btn px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
        });
        const activeBtn = document.querySelector(`[data-tab="${tab}"]`);
        if (activeBtn) activeBtn.className = 'tab-btn active px-4 py-2 rounded-xl text-xs font-semibold bg-primary-500 text-white';

        if (tab === 'pending') this.loadPending();
        else if (tab === 'reports') this.loadReports();
    },

    async loadPending() {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Load pending error:', error);
                document.getElementById('moderation-list').innerHTML = `<p class="text-center text-red-400">Gagal memuat data: ${escapeHtml(error.message || 'Unknown')}</p>`;
                return;
            }

            const posts = (data || []).map(row => DB.normalizePost(row));
            this.renderModerationList(posts, 'post');
        } catch (err) {
            document.getElementById('moderation-list').innerHTML = '<p class="text-center text-red-400">Gagal memuat data</p>';
        }
    },

    async loadReports() {
        try {
            const reports = await DB.getReports('pending');
            const container = document.getElementById('moderation-list');
            if (!container) return;

            if (reports.length === 0) {
                container.innerHTML = '<p class="text-center text-gray-400 py-8">Tidak ada laporan</p>';
                return;
            }

            container.innerHTML = reports.map(report => `
                <div class="card p-5">
                    <div class="flex items-start justify-between">
                        <div>
                            <h4 class="font-semibold text-gray-900 dark:text-white text-sm">Laporan: ${escapeHtml(report.reason || 'Tidak diketahui')}</h4>
                            <p class="text-xs text-gray-400 mt-1">${escapeHtml(report.detail || '')}</p>
                            <p class="text-xs text-gray-400 mt-1">Oleh: ${escapeHtml(report.reporterName || 'Anonymous')}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="ModerasiPage.resolveReport('${report.id}', 'resolved')" class="btn-primary btn-sm">Selesai</button>
                            <button onclick="ModerasiPage.resolveReport('${report.id}', 'dismissed')" class="btn-outline btn-sm">Abaikan</button>
                        </div>
                    </div>
                </div>`).join('');
        } catch (err) {
            document.getElementById('moderation-list').innerHTML = '<p class="text-center text-red-400">Gagal memuat laporan</p>';
        }
    },

    renderModerationList(posts, type) {
        const container = document.getElementById('moderation-list');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = '<p class="text-center text-gray-400 py-8">Tidak ada yang perlu dimoderasi</p>';
            return;
        }

        container.innerHTML = posts.map(post => `
            <div class="card p-5">
                <div class="flex items-start gap-4">
                    <div class="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold flex-shrink-0 overflow-hidden">
                        ${post.photoURL ? `<img src="${escapeHtml(post.photoURL)}" class="w-full h-full object-cover">` : escapeHtml((post.fullName || '?')[0]).toUpperCase()}
                    </div>
                    <div class="flex-1 min-w-0">
                        <h4 class="font-semibold text-gray-900 dark:text-white">${escapeHtml(post.fullName || 'Tidak diketahui')}</h4>
                        <p class="text-xs text-gray-400 mt-1 line-clamp-2">${escapeHtml(post.description || '')}</p>
                        <p class="text-xs text-gray-400 mt-1">Oleh: ${escapeHtml(post.authorName || post.reporterName || 'Unknown')}</p>
                    </div>
                    <div class="flex gap-2 flex-shrink-0">
                        <button onclick="Router.navigate('detail-posting', {id:'${post.id}'})" class="btn-outline btn-sm">Review</button>
                        <button onclick="ModerasiPage.approvePost('${post.id}')" class="btn-primary btn-sm bg-green-600 hover:bg-green-700">Approve</button>
                        <button onclick="ModerasiPage.rejectPost('${post.id}')" class="btn-danger btn-sm">Tolak</button>
                    </div>
                </div>
            </div>`).join('');
    },

    async approvePost(postId) {
        try {
            await DB.updatePost(postId, { status: 'approved' });
            Toast.show('Posting disetujui', 'success');
            this.loadPending();
        } catch (err) {
            Toast.show('Gagal approve', 'error');
        }
    },

    async rejectPost(postId) {
        try {
            await DB.updatePost(postId, { status: 'rejected' });
            Toast.show('Posting ditolak', 'success');
            this.loadPending();
        } catch (err) {
            Toast.show('Gagal menolak', 'error');
        }
    },

    async resolveReport(reportId, action) {
        try {
            await DB.resolveReport(reportId, action);
            Toast.show('Laporan diproses', 'success');
            this.loadReports();
        } catch (err) {
            Toast.show('Gagal memproses laporan', 'error');
        }
    }
};
