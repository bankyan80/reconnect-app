// Cari Orang Page
const CariOrangPage = {
    allPosts: [],
    searchContainer: null,

    async render(container, params = {}) {
        container.innerHTML = `
            <div class="max-w-5xl mx-auto space-y-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Cari Orang</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Temukan keluarga, sahabat, dan kerabat Anda</p>
                </div>

                <!-- Search Bar -->
                <div class="card p-4">
                    <div class="flex items-center bg-gray-50 dark:bg-gray-700 rounded-xl px-4 py-3">
                        <svg class="w-5 h-5 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" id="search-input" placeholder="Ketik nama, lokasi, sekolah..." class="bg-transparent outline-none flex-1 dark:text-white dark:placeholder-gray-400" value="${escapeHtml(params.query || '')}">
                        <button onclick="CariOrangPage.clearSearch()" class="text-gray-400 hover:text-gray-600 ml-2 hidden" id="clear-btn">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                    <div class="flex items-center gap-2 mt-3 flex-wrap">
                        <span class="text-xs text-gray-400">Filter:</span>
                        <select id="filter-status" class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none">
                            <option value="">Semua Status</option>
                            <option value="searching">Mencari</option>
                            <option value="found">Ditemukan</option>
                            <option value="closed">Ditutup</option>
                        </select>
                        <select id="filter-gender" class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none">
                            <option value="">Semua Gender</option>
                            <option value="Laki-laki">Laki-laki</option>
                            <option value="Perempuan">Perempuan</option>
                        </select>
                    </div>
                </div>

                <!-- Results -->
                <div id="search-results" class="space-y-4">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        ${this.renderSkeleton()}
                    </div>
                </div>

                <!-- Load More -->
                <div id="load-more" class="text-center hidden">
                    <button onclick="CariOrangPage.loadMore()" class="btn-outline btn-sm">Muat Lebih Banyak</button>
                </div>
            </div>`;

        this.initSearch(params.query);
        this.loadPosts();
    },

    renderSkeleton() {
        return Array(6).fill(`
            <div class="search-result-card">
                <div class="flex items-start gap-3">
                    <div class="w-14 h-14 skeleton rounded-xl"></div>
                    <div class="flex-1 space-y-2">
                        <div class="skeleton h-4 w-3/4 rounded"></div>
                        <div class="skeleton h-3 w-1/2 rounded"></div>
                        <div class="skeleton h-3 w-full rounded"></div>
                    </div>
                </div>
            </div>`).join('');
    },

    initSearch(query) {
        const input = document.getElementById('search-input');
        const clearBtn = document.getElementById('clear-btn');
        let timer;

        input.addEventListener('input', (e) => {
            clearBtn.classList.toggle('hidden', !e.target.value);
            clearTimeout(timer);
            timer = setTimeout(() => this.filterPosts(e.target.value), 300);
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.filterPosts(e.target.value);
        });

        document.getElementById('filter-status').addEventListener('change', () => this.filterPosts(input.value));
        document.getElementById('filter-gender').addEventListener('change', () => this.filterPosts(input.value));

        if (query) {
            clearBtn.classList.remove('hidden');
            setTimeout(() => this.filterPosts(query), 500);
        }
    },

    clearSearch() {
        document.getElementById('search-input').value = '';
        document.getElementById('clear-btn').classList.add('hidden');
        this.filterPosts('');
    },

    async loadPosts() {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Supabase error:', error);
                document.getElementById('search-results').innerHTML = `<p class="text-center text-red-400 py-8">Gagal memuat data: ${escapeHtml(error.message || 'Unknown error')}</p>`;
                return;
            }

            this.allPosts = (data || []).map(row => DB.normalizePost(row));
            this.renderResults(this.allPosts);
        } catch (err) {
            console.error('Load posts error:', err);
            document.getElementById('search-results').innerHTML = `<p class="text-center text-red-400 py-8">Gagal memuat data: ${escapeHtml(err.message)}</p>`;
        }
    },

    filterPosts(query) {
        let results = [...this.allPosts];
        const statusFilter = document.getElementById('filter-status')?.value;
        const genderFilter = document.getElementById('filter-gender')?.value;

        if (statusFilter) results = results.filter(p => p.status === statusFilter);
        if (genderFilter) results = results.filter(p => p.gender === genderFilter);

        if (query && query.trim()) {
            const terms = query.toLowerCase().split(/\s+/);
            results = results.filter(post => {
                const searchable = [
                    post.fullName, post.nickname, post.description,
                    post.city, post.province, post.country,
                    post.school, post.university, post.workplace,
                    post.physicalFeatures, post.reporterName, post.relation,
                    post.hobby, post.language
                ].filter(Boolean).join(' ').toLowerCase();
                return terms.some(term => searchable.includes(term) || SearchEngine.fuzzyMatch(term, searchable));
            });
        }

        this.renderResults(results);
    },

    renderResults(posts) {
        const container = document.getElementById('search-results');
        if (!container) return;

        if (posts.length === 0) {
            container.innerHTML = `
                <div class="text-center py-12">
                    <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                    <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Tidak ada hasil</h3>
                    <p class="text-sm text-gray-400 mt-1">Coba kata kunci yang berbeda</p>
                </div>`;
            return;
        }

        container.innerHTML = `
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">${posts.length} orang ditemukan</p>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${posts.map(post => this.renderCard(post)).join('')}
            </div>`;
    },

    renderCard(post) {
        const score = post.aiScore || 0;
        const scoreBadge = score >= 80 ? 'badge-success' : score >= 50 ? 'badge-warning' : 'badge-info';

        return `
        <div onclick="Router.navigate('detail-posting', {id:'${post.id}'})" class="search-result-card">
            <div class="flex items-start gap-4">
                <div class="w-14 h-14 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-xl flex-shrink-0 overflow-hidden">
                    ${post.photoURL ? `<img src="${escapeHtml(post.photoURL)}" alt="" class="w-full h-full object-cover">` : escapeHtml((post.fullName || '?')[0]).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-2">
                        <h3 class="font-bold text-gray-900 dark:text-white truncate">${escapeHtml(post.fullName || 'Tidak diketahui')}</h3>
                        ${score > 0 ? `<span class="badge ${scoreBadge} text-[10px]">${score}%</span>` : ''}
                    </div>
                    ${post.nickname ? `<p class="text-xs text-gray-400">Panggilan: ${escapeHtml(post.nickname)}</p>` : ''}
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">${escapeHtml(post.description || 'Tidak ada deskripsi')}</p>
                    <div class="flex flex-wrap items-center gap-2 mt-2">
                        ${post.city ? `<span class="inline-flex items-center gap-1 text-xs text-primary-500"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>${escapeHtml(post.city)}</span>` : ''}
                        ${post.school ? `<span class="inline-flex items-center gap-1 text-xs text-gray-400"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5z"/></svg>${escapeHtml(post.school)}</span>` : ''}
                        ${post.gender ? `<span class="text-xs text-gray-400">${escapeHtml(post.gender)}</span>` : ''}
                    </div>
                    ${post.status ? `<span class="inline-block mt-2 badge ${post.status === 'found' ? 'badge-success' : post.status === 'closed' ? 'badge-danger' : 'badge-warning'}">${escapeHtml(post.status === 'searching' ? 'Mencari' : post.status === 'found' ? 'Ditemukan' : 'Ditutup')}</span>` : ''}
                </div>
            </div>
        </div>`;
    },

    loadMore() {
        // Pagination placeholder
        Toast.show('Semua data telah dimuat', 'info');
    }
};
