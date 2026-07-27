// Notifikasi Page
const NotifikasiPage = {
    async render(container) {
        if (!FirebaseAuth.isLoggedIn()) {
            container.innerHTML = `
                <div class="max-w-lg mx-auto text-center py-20">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Login Diperlukan</h2>
                    <p class="text-gray-500 text-sm mb-4">Login untuk melihat notifikasi</p>
                    <button onclick="Router.navigate('login')" class="btn-primary">Login</button>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="max-w-3xl mx-auto space-y-6">
                <div class="flex items-center justify-between">
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Notifikasi</h1>
                    <button onclick="NotifikasiPage.markAllRead()" class="text-sm text-primary-500 hover:text-primary-600 font-medium">Tandai Semua Dibaca</button>
                </div>
                <div id="notifications-list" class="space-y-3">
                    ${Array(4).fill(`
                    <div class="card p-4"><div class="flex items-start gap-3"><div class="w-10 h-10 skeleton rounded-full"></div><div class="flex-1 space-y-2"><div class="skeleton h-4 w-3/4 rounded"></div><div class="skeleton h-3 w-1/2 rounded"></div></div></div></div>`).join('')}
                </div>
            </div>`;

        this.loadNotifications();
    },

    async loadNotifications() {
        try {
            const notifications = await DB.getNotifications(FirebaseAuth.currentUser.uid);
            const container = document.getElementById('notifications-list');
            if (!container) return;

            if (notifications.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-12">
                        <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Tidak ada notifikasi</h3>
                    </div>`;
                return;
            }

            container.innerHTML = notifications.map(notif => `
                <div class="card p-4 hover:shadow-md transition-all cursor-pointer ${!notif.read ? 'border-l-4 border-l-primary-500' : ''}" onclick="NotifikasiPage.markRead('${notif.id}')">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                            <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                        </div>
                        <div class="flex-1">
                            <p class="text-sm text-gray-900 dark:text-white ${!notif.read ? 'font-semibold' : ''}">${escapeHtml(notif.message || notif.title || 'Notifikasi')}</p>
                            ${notif.description ? `<p class="text-xs text-gray-400 mt-1">${escapeHtml(notif.description)}</p>` : ''}
                            <p class="text-xs text-gray-400 mt-1">${App.timeAgo(notif.createdAt)}</p>
                        </div>
                    </div>
                </div>`).join('');
        } catch (err) {
            document.getElementById('notifications-list').innerHTML = '<p class="text-center text-red-400 py-8">Gagal memuat notifikasi</p>';
        }
    },

    async markRead(notifId) {
        await DB.markNotificationRead(notifId);
        App.updateNotificationBadges();
    },

    async markAllRead() {
        try {
            const notifs = await DB.getNotifications(FirebaseAuth.currentUser.uid);
            await Promise.all(notifs.filter(n => !n.read).map(n => DB.markNotificationRead(n.id)));
            Toast.show('Semua notifikasi ditandai sudah dibaca', 'success');
            App.updateNotificationBadges();
            this.loadNotifications();
        } catch (err) {
            Toast.show('Gagal update notifikasi', 'error');
        }
    }
};
