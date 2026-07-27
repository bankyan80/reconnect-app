// Topbar Component
const Topbar = {
    _outsideClickHandler: null,

    renderUserMenu() {
        const container = document.getElementById('user-menu-container');
        if (!container) return;
        const user = FirebaseAuth.currentUser;
        const profile = FirebaseAuth.userProfile;

        if (!user) {
            container.innerHTML = '';
            this._removeOutsideClickHandler();
            return;
        }

        const initial = (profile?.displayName || user.displayName || 'U')[0].toUpperCase();
        container.innerHTML = `
            <div class="relative">
                <button onclick="Topbar.toggleMenu()" class="flex items-center gap-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition">
                    <div class="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center overflow-hidden ring-2 ring-primary-300 dark:ring-primary-700">
                        <img src="public/reconnect_icon_no_text_curved.png" alt="RN" class="w-6 h-6 object-contain">
                    </div>
                    <svg class="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
                </button>
                <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50">
                    <div class="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p class="font-semibold text-gray-900 dark:text-white text-sm">${escapeHtml(profile?.displayName || user.displayName || 'User')}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">${escapeHtml(user.email || '')}</p>
                        <span class="badge badge-info mt-1 capitalize">${escapeHtml(profile?.role || 'member')}</span>
                    </div>
                    <a href="#" onclick="Router.navigate('posting-saya'); Topbar.closeMenu(); return false;" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-300">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                        Posting Saya
                    </a>
                    <a href="#" onclick="Router.navigate('favorit'); Topbar.closeMenu(); return false;" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 text-sm text-gray-700 dark:text-gray-300">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        Favorit
                    </a>
                    <div class="border-t border-gray-100 dark:border-gray-700 mt-1 pt-1">
                        <button onclick="FirebaseAuth.logout(); Topbar.closeMenu();" class="flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 dark:hover:bg-red-900/10 text-sm text-red-600 dark:text-red-400 w-full">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                            Logout
                        </button>
                    </div>
                </div>
            </div>`;

        this._removeOutsideClickHandler();
        this._outsideClickHandler = (e) => {
            if (container && !container.contains(e.target)) this.closeMenu();
        };
        document.addEventListener('click', this._outsideClickHandler);
    },

    _removeOutsideClickHandler() {
        if (this._outsideClickHandler) {
            document.removeEventListener('click', this._outsideClickHandler);
            this._outsideClickHandler = null;
        }
    },

    toggleMenu() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) dropdown.classList.toggle('hidden');
    },

    closeMenu() {
        const dropdown = document.getElementById('user-dropdown');
        if (dropdown) dropdown.classList.add('hidden');
    }
};
