// Bottom Navigation Component (Mobile)
const BottomNav = {
    render() {
        const nav = document.getElementById('bottom-nav');
        const current = Router.currentPage;
        const isLoggedIn = FirebaseAuth.isLoggedIn();

        if (!isLoggedIn) {
            nav.innerHTML = `<div class="flex items-center justify-around h-16 max-w-lg mx-auto">
                <button onclick="Router.navigate('dashboard')" class="flex flex-col items-center justify-center py-1 px-3 relative">
                    <svg class="w-6 h-6 ${current === 'dashboard' ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}" fill="${current === 'dashboard' ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    ${current === 'dashboard' ? '<div class="absolute -top-1 w-6 h-1 bg-primary-500 rounded-full"></div>' : ''}
                </button>
                <button onclick="Router.navigate('cari-orang')" class="flex flex-col items-center justify-center -mt-5">
                    <div class="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 active:scale-95 transition-all">
                        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    </div>
                </button>
                <button onclick="Router.navigate('login')" class="flex flex-col items-center justify-center py-1 px-3 relative">
                    <svg class="w-6 h-6 ${current === 'login' ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}" fill="${current === 'login' ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                </button>
            </div>`;
            return;
        }

        nav.innerHTML = `<div class="flex items-center justify-around h-16 max-w-lg mx-auto">
            <button onclick="Router.navigate('dashboard')" class="flex flex-col items-center justify-center py-1 px-3 relative">
                <svg class="w-6 h-6 ${current === 'dashboard' ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}" fill="${current === 'dashboard' ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                ${current === 'dashboard' ? '<div class="absolute -top-1 w-6 h-1 bg-primary-500 rounded-full"></div>' : ''}
            </button>
            <button onclick="Router.navigate('posting-baru')" class="flex flex-col items-center justify-center py-1 px-3 relative">
                <svg class="w-6 h-6 ${current === 'posting-baru' ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}" fill="${current === 'posting-baru' ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                ${current === 'posting-baru' ? '<div class="absolute -top-1 w-6 h-1 bg-primary-500 rounded-full"></div>' : ''}
            </button>
            <button onclick="Router.navigate('cari-orang')" class="flex flex-col items-center justify-center">
                <div class="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30 active:scale-95 transition-all">
                    <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                </div>
            </button>
            <button onclick="Router.navigate('notifikasi')" class="flex flex-col items-center justify-center py-1 px-3 relative">
                <svg class="w-6 h-6 ${current === 'notifikasi' ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}" fill="${current === 'notifikasi' ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
                <span id="bottom-notif-badge" class="hidden absolute -top-1 -right-1 w-4 h-4 bg-danger text-white text-[9px] rounded-full flex items-center justify-center font-bold">0</span>
                ${current === 'notifikasi' ? '<div class="absolute -top-1 w-6 h-1 bg-primary-500 rounded-full"></div>' : ''}
            </button>
            <button onclick="Router.navigate('favorit')" class="flex flex-col items-center justify-center py-1 px-3 relative">
                <svg class="w-6 h-6 ${current === 'favorit' ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}" fill="${current === 'favorit' ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                ${current === 'favorit' ? '<div class="absolute -top-1 w-6 h-1 bg-primary-500 rounded-full"></div>' : ''}
            </button>
        </div>`;
    }
};
