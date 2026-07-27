// Admin Page
const AdminPage = {
    async render(container) {
        if (!FirebaseAuth.isAdmin()) {
            container.innerHTML = '<p class="text-center text-gray-400 py-12">Akses ditolak</p>';
            return;
        }

        container.innerHTML = `
            <div class="max-w-6xl mx-auto space-y-6">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>

                <!-- AI Crawler Section -->
                <div class="card">
                    <div class="card-header">
                        <h3 class="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                            <svg class="w-5 h-5 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                            AI Online Crawler
                        </h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">Cari & ambil data orang hilang dari media sosial secara otomatis</p>
                    </div>
                    <div class="card-body space-y-4">
                        <div class="flex gap-3">
                            <input type="text" id="crawler-query" placeholder="Contoh: orang hilang Jakarta, missing person Bandung..." class="form-input flex-1">
                            <button onclick="AdminPage.startCrawl()" id="crawl-btn" class="btn-accent flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                                Mulai Crawl
                            </button>
                        </div>
                        <div class="grid grid-cols-3 gap-4 text-center">
                            <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <p class="text-lg font-bold text-gray-900 dark:text-white" id="crawl-found">0</p>
                                <p class="text-xs text-gray-500">Ditemukan</p>
                            </div>
                            <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <p class="text-lg font-bold text-green-600" id="crawl-posted">0</p>
                                <p class="text-xs text-gray-500">Auto-Post</p>
                            </div>
                            <div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <p class="text-lg font-bold text-blue-600" id="crawl-matched">0</p>
                                <p class="text-xs text-gray-500">Cocok</p>
                            </div>
                        </div>
                        <div class="max-h-64 overflow-y-auto bg-gray-50 dark:bg-gray-900 rounded-xl p-3" id="crawler-logs">
                            <p class="text-xs text-gray-400 text-center py-4">Belum ada log crawl</p>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <!-- User Management -->
                    <div class="lg:col-span-2">
                        <div class="card">
                            <div class="card-header">
                                <h3 class="font-semibold text-gray-900 dark:text-white">Manajemen Pengguna</h3>
                            </div>
                            <div class="card-body" id="users-list">
                                <div class="skeleton h-10 w-full rounded mb-2"></div>
                                <div class="skeleton h-10 w-full rounded mb-2"></div>
                                <div class="skeleton h-10 w-full rounded"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="space-y-4">
                        <div class="card p-5">
                            <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                            <div class="space-y-2">
                                <button onclick="AdminPage.exportData()" class="w-full btn-outline btn-sm flex items-center gap-2 justify-center">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    Export Data
                                </button>
                                <button onclick="AdminPage.clearCache()" class="w-full btn-outline btn-sm flex items-center gap-2 justify-center">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                    Clear AI Cache
                                </button>
                            </div>
                        </div>
                        <div class="card p-5">
                            <h3 class="font-semibold text-gray-900 dark:text-white mb-3">Audit Log</h3>
                            <div id="audit-log" class="space-y-2 max-h-64 overflow-y-auto">
                                <p class="text-xs text-gray-400">Memuat...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;

        this.loadUsers();
        this.loadAuditLogs();
    },

    async startCrawl() {
        const query = document.getElementById('crawler-query')?.value?.trim();
        if (!query) {
            Toast.show('Masukkan kata kunci pencarian', 'warning');
            return;
        }

        const btn = document.getElementById('crawl-btn');
        if (btn) {
            btn.disabled = true;
            btn.innerHTML = '<div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Crawling...';
        }

        try {
            const result = await AICrawler.runCrawl(query);
            document.getElementById('crawl-found').textContent = result.found || 0;
            document.getElementById('crawl-posted').textContent = result.posted || 0;
            document.getElementById('crawl-matched').textContent = result.matched || 0;
            Toast.show(`Crawl selesai: ${result.posted} post baru, ${result.matched} cocok`, 'success');
        } catch (err) {
            Toast.show('Crawl gagal: ' + err.message, 'error');
        }

        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg> Mulai Crawl';
        }
    },

    async loadUsers() {
        try {
            const users = await DB.getUsers(50);
            const container = document.getElementById('users-list');
            if (!container) return;

            container.innerHTML = `
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-gray-100 dark:border-gray-700">
                                <th class="text-left py-3 px-2 text-xs font-semibold text-gray-500">Nama</th>
                                <th class="text-left py-3 px-2 text-xs font-semibold text-gray-500">Email</th>
                                <th class="text-left py-3 px-2 text-xs font-semibold text-gray-500">Role</th>
                                <th class="text-left py-3 px-2 text-xs font-semibold text-gray-500">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                            <tr class="border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                <td class="py-3 px-2 font-medium text-gray-900 dark:text-white">${escapeHtml(user.displayName || 'User')}</td>
                                <td class="py-3 px-2 text-gray-500 dark:text-gray-400">${escapeHtml(user.email || '')}</td>
                                <td class="py-3 px-2"><span class="badge ${user.role === 'admin' ? 'badge-danger' : user.role === 'moderator' ? 'badge-warning' : 'badge-info'} capitalize">${escapeHtml(user.role || 'member')}</span></td>
                                <td class="py-3 px-2">
                                    <select onchange="AdminPage.changeRole('${escapeHtml(user.id)}', this.value)" class="text-xs px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none">
                                        <option value="member" ${user.role === 'member' ? 'selected' : ''}>Member</option>
                                        <option value="moderator" ${user.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                                    </select>
                                </td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`;
        } catch (err) {
            const el = document.getElementById('users-list');
            if (el) el.innerHTML = '<p class="text-center text-red-400">Gagal memuat</p>';
        }
    },

    async changeRole(uid, role) {
        try {
            await DB.updateUserRole(uid, role);
            Toast.show('Role berhasil diupdate', 'success');
        } catch (err) {
            Toast.show('Gagal update role', 'error');
        }
    },

    async loadAuditLogs() {
        try {
            const { data, error } = await supabase.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(20);
            if (error) { console.error('Audit log error:', error); }
            const logs = (data || []).map(l => ({ ...l, createdAt: l.created_at }));
            const container = document.getElementById('audit-log');
            if (!container) return;

            if (logs.length === 0) {
                container.innerHTML = '<p class="text-xs text-gray-400">Belum ada log</p>';
                return;
            }

            container.innerHTML = logs.map(log => `
                <div class="text-xs p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <p class="text-gray-700 dark:text-gray-300">${escapeHtml(log.action || '')}</p>
                    <p class="text-gray-400 mt-0.5">${App.timeAgo(log.createdAt)}</p>
                </div>`).join('');
        } catch (err) {
            const el = document.getElementById('audit-log');
            if (el) el.innerHTML = '<p class="text-xs text-gray-400">Gagal memuat</p>';
        }
    },

    async exportData() {
        try {
            const { data, error } = await supabase.from('posts').select('*');
            if (error) { Toast.show('Gagal export: ' + error.message, 'error'); return; }
            const rows = data || [];
            const json = JSON.stringify(rows, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cari-keluarga-export-${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            Toast.show('Data berhasil diexport', 'success');
        } catch (err) {
            Toast.show('Gagal export data', 'error');
        }
    },

    async clearCache() {
        try {
            const now = new Date().toISOString();
            await supabase.from('ai_recommendation_cache').delete().lt('expires_at', now);
            Toast.show('Cache AI berhasil dibersihkan', 'success');
        } catch (err) {
            Toast.show('Gagal membersihkan cache', 'error');
        }
    }
};
