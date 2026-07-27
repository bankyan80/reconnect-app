// Favorit Page
const FavoritPage = {
    async render(container) {
        if (!FirebaseAuth.isLoggedIn()) {
            container.innerHTML = `
                <div class="max-w-lg mx-auto text-center py-20">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Login Diperlukan</h2>
                    <p class="text-gray-500 text-sm mb-4">Login untuk melihat favorit</p>
                    <button onclick="Router.navigate('login')" class="btn-primary">Login</button>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-6">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Favorit</h1>
                <div id="favorites-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    ${Array(4).fill(`
                    <div class="card p-5"><div class="flex items-start gap-3"><div class="w-14 h-14 skeleton rounded-xl"></div><div class="flex-1 space-y-2"><div class="skeleton h-4 w-3/4 rounded"></div><div class="skeleton h-3 w-full rounded"></div></div></div></div>`).join('')}
                </div>
            </div>`;

        this.loadFavorites();
    },

    async loadFavorites() {
        try {
            const favorites = await DB.getFavorites(FirebaseAuth.currentUser.uid);
            const container = document.getElementById('favorites-list');
            if (!container) return;

            if (favorites.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Belum ada favorit</h3>
                        <p class="text-sm text-gray-400 mt-1">Klik ikon hati pada posting untuk menambahkan ke favorit</p>
                    </div>`;
                return;
            }

            container.innerHTML = favorites.map(post => CariOrangPage.renderCard(post)).join('');
        } catch (err) {
            document.getElementById('favorites-list').innerHTML = '<p class="col-span-full text-center text-red-400 py-8">Gagal memuat favorit</p>';
        }
    }
};
