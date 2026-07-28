// Sidebar Component
const Sidebar = {
    menuItems: [
        { id: 'dashboard', label: 'Dashboard', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>', roles: ['guest','member','moderator','admin'] },
        { id: 'cari-orang', label: 'Cari Orang', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>', roles: ['guest','member','moderator','admin'] },
        { id: 'ai-search', label: 'AI Search', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>', roles: ['guest','member','moderator','admin'], accent: true },
        { id: 'ai-chat', label: 'AI Assistant', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>', roles: ['guest','member','moderator','admin'], accent: true },
        { id: 'ai-recommendation', label: 'Rekomendasi AI', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>', roles: ['guest','member','moderator','admin'] },
        { type: 'divider', roles: ['member','moderator','admin'] },
        { id: 'posting-baru', label: 'Posting Baru', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>', roles: ['member','moderator','admin'], accent: true },
        { id: 'posting-saya', label: 'Posting Saya', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>', roles: ['member','moderator','admin'] },
        { id: 'favorit', label: 'Favorit', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>', roles: ['member','moderator','admin'] },
        { id: 'notifikasi', label: 'Notifikasi', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>', roles: ['member','moderator','admin'], badge: true },
        { id: 'riwayat', label: 'Riwayat', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>', roles: ['member','moderator','admin'] },
        { id: 'location', label: 'Share Location', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>', roles: ['member','moderator','admin'] },
        { type: 'divider', roles: ['moderator','admin'] },
        { id: 'moderasi', label: 'Moderasi', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>', roles: ['moderator','admin'] },
        { type: 'divider', roles: ['admin'] },
        { id: 'admin', label: 'Admin Panel', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>', roles: ['admin'] },
        { type: 'divider' },
        { id: 'tentang', label: 'Tentang', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>', roles: ['guest','member','moderator','admin'] },
        { id: 'bantuan', label: 'Bantuan', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>', roles: ['guest','member','moderator','admin'] },
        { id: 'kontak', label: 'Kontak', icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>', roles: ['guest','member','moderator','admin'] },
    ],

    render() {
        const nav = document.getElementById('sidebar-nav');
        if (!nav) return;
        const role = FirebaseAuth.getRole();
        const current = Router.currentPage;
        const items = this.menuItems.filter(item => item.roles && item.roles.includes(role));

        nav.innerHTML = items.map(item => {
            if (item.type === 'divider') return '<div class="border-t border-gray-200/30 dark:border-gray-700/30 my-3"></div>';
            const active = current === item.id ? 'active' : '';
            const accentClass = item.accent ? 'text-accent-600 dark:text-accent-400' : '';
            return `<a href="#" onclick="Router.navigate('${item.id}'); toggleSidebar(); return false;" class="sidebar-link ${active} ${accentClass}">
                <span>${escapeHtml(item.label)}</span>
                ${item.badge ? '<span id="sidebar-notif-badge" class="hidden ml-auto w-5 h-5 bg-danger text-white text-xs rounded-full flex items-center justify-center font-bold">0</span>' : ''}
            </a>`;
        }).join('');
    },

    renderUser() {
        const container = document.getElementById('sidebar-user');
        if (!container) return;
        const user = FirebaseAuth.currentUser;
        const profile = FirebaseAuth.userProfile;

        if (!user) {
            container.innerHTML = `<button onclick="Router.navigate('login'); toggleSidebar();" class="w-full flex items-center gap-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                <div class="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </div>
                <p class="text-sm font-semibold text-gray-700 dark:text-gray-200">Login</p>
            </button>`;
            return;
        }

        const initial = (profile?.displayName || user.displayName || 'U')[0].toUpperCase();
        container.innerHTML = `
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden ring-2 ring-primary-300 dark:ring-primary-700 flex-shrink-0">
                    <img src="public/reconnect_icon_no_text_curved.png" alt="RN" class="w-7 h-7 object-contain">
                </div>
                <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-gray-700 dark:text-gray-200 truncate">${escapeHtml(profile?.displayName || user.displayName || 'User')}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 capitalize">${escapeHtml(profile?.role || 'member')}</p>
                </div>
                <button onclick="FirebaseAuth.logout()" class="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition text-gray-500 dark:text-gray-400" title="Logout">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                </button>
            </div>`;
    }
};

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const isMobile = window.innerWidth < 1024;
    if (!isMobile) return;
    sidebar.classList.toggle('hidden');
    sidebar.classList.toggle('fixed');
    sidebar.classList.toggle('inset-y-0');
    sidebar.classList.toggle('right-0');
    sidebar.classList.toggle('z-40');
    overlay.classList.toggle('hidden');
}
