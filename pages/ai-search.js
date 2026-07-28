// AI Search Page
const AISearchPage = {
    async render(container) {
        container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-6">
                <div class="text-center">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-accent-100 dark:bg-accent-900/30 rounded-2xl mb-4">
                        <svg class="w-8 h-8 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">AI Search</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Pencarian cerdas dengan kecerdasan buatan</p>
                </div>

                <!-- Search Input -->
                <div class="card p-6">
                    <div class="relative">
                        <svg class="w-6 h-6 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
                        <input type="text" id="ai-search-input" placeholder="Ketik nama, lokasi, sekolah, atau deskripsi..." class="w-full pl-14 pr-4 py-4 text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-400 focus:border-accent-400 outline-none transition-all">
                        <div id="ai-typing" class="hidden absolute right-4 top-1/2 -translate-y-1/2">
                            <div class="flex gap-1">
                                <div class="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style="animation-delay:0ms"></div>
                                <div class="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style="animation-delay:150ms"></div>
                                <div class="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style="animation-delay:300ms"></div>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 mt-3 text-xs text-gray-400">
                        <svg class="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        <span>AI akan menganalisis nama mirip, typo, ejaan berbeda, lokasi, dan konteks lainnya</span>
                    </div>
                </div>

                <!-- Results -->
                <div id="ai-results" class="space-y-4 hidden">
                    <div class="flex items-center justify-between">
                        <h3 class="font-semibold text-gray-900 dark:text-white" id="result-count"></h3>
                        <div class="flex items-center gap-2">
                            <select id="sort-results" class="text-xs px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none" onchange="AISearchPage.sortResults()">
                                <option value="score">Skor Tertinggi</option>
                                <option value="newest">Terbaru</option>
                                <option value="name">Nama A-Z</option>
                            </select>
                        </div>
                    </div>
                    <div id="results-list" class="space-y-3"></div>
                </div>

                <!-- Empty State -->
                <div id="ai-empty" class="text-center py-12">
                    <svg class="w-20 h-20 mx-auto text-gray-200 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                    <h3 class="text-lg font-semibold text-gray-500 dark:text-gray-400">Mulai Pencarian AI</h3>
                    <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Ketik nama atau deskripsi untuk mencari</p>
                </div>

                <!-- Loading -->
                <div id="ai-loading" class="hidden text-center py-12">
                    <div class="inline-block w-12 h-12 border-4 border-accent-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p class="text-gray-500 dark:text-gray-400 font-medium">AI sedang menganalisis...</p>
                    <p class="text-xs text-gray-400 mt-1">Membandingkan dengan seluruh database</p>
                </div>
            </div>`;

        this.initSearch();
    },

    initSearch() {
        const input = document.getElementById('ai-search-input');
        let timer;

        input.addEventListener('input', (e) => {
            clearTimeout(timer);
            const val = e.target.value.trim();
            if (val.length >= 2) {
                document.getElementById('ai-typing').classList.remove('hidden');
                timer = setTimeout(() => this.performSearch(val), 500);
            } else {
                this.showEmpty();
            }
        });

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
                clearTimeout(timer);
                this.performSearch(e.target.value.trim());
            }
        });

        input.focus();
    },

    async performSearch(query) {
        const loading = document.getElementById('ai-loading');
        const results = document.getElementById('ai-results');
        const empty = document.getElementById('ai-empty');

        loading.classList.remove('hidden');
        results.classList.add('hidden');
        empty.classList.add('hidden');

        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) {
                console.error('Supabase AI search error:', error);
                Toast.show('Gagal mengambil data: ' + (error.message || 'Unknown'), 'error');
                this.showEmpty();
                loading.classList.add('hidden');
                return;
            }

            const posts = (data || []).map(row => DB.normalizePost(row));
            let searchResults = await AIEngine.search(query, posts);

            if (!searchResults || searchResults.length === 0) {
                searchResults = AIEngine.fallbackSearch(query, posts);
            }

            this.currentResults = searchResults;
            this.renderResults(searchResults);

            if (searchResults.length === 0) {
                this.renderAIInsight(query);
            }
        } catch (err) {
            console.error('AI Search error:', err);
            Toast.show('Gagal melakukan pencarian AI', 'error');
            this.showEmpty();
        }

        loading.classList.add('hidden');
        document.getElementById('ai-typing').classList.add('hidden');
    },

    renderResults(posts) {
        const container = document.getElementById('ai-results');
        const list = document.getElementById('results-list');
        const countEl = document.getElementById('result-count');

        if (posts.length === 0) {
            list.innerHTML = '<p class="text-center text-gray-400 py-8">Tidak ada hasil ditemukan</p>';
        } else {
            countEl.textContent = `${posts.length} hasil ditemukan`;
            list.innerHTML = posts.map(post => this.renderResultCard(post)).join('');
        }

        container.classList.remove('hidden');
    },

    renderResultCard(post) {
        const score = post.aiScore || 0;
        const label = App.getScoreLabel(score);
        const stars = App.renderStars(score);

        return `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer" onclick="Router.navigate('detail-posting', {id:'${post.id}'})">
            <div class="flex items-start gap-4">
                <div class="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-xl flex-shrink-0 overflow-hidden">
                    ${post.photoURL ? `<img src="${escapeHtml(post.photoURL)}" alt="" class="w-full h-full object-cover">` : escapeHtml((post.fullName || '?')[0]).toUpperCase()}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <h3 class="font-bold text-gray-900 dark:text-white text-lg">${escapeHtml(post.fullName || 'Tidak diketahui')}</h3>
                            ${post.nickname ? `<p class="text-xs text-gray-400">Panggilan: ${escapeHtml(post.nickname)}</p>` : ''}
                        </div>
                        ${score > 0 ? `
                        <div class="text-right flex-shrink-0">
                            <div class="text-2xl font-bold text-accent-500">${score}%</div>
                            <p class="text-xs ${label.class} font-medium">${escapeHtml(label.text)}</p>
                        </div>` : ''}
                    </div>
                    <div class="flex items-center gap-1 mt-1">${stars}</div>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">${escapeHtml(post.description || 'Tidak ada deskripsi')}</p>
                    <div class="flex flex-wrap items-center gap-2 mt-3">
                        ${post.city ? `<span class="badge badge-info">${escapeHtml(post.city)}</span>` : ''}
                        ${post.school ? `<span class="badge badge-success">${escapeHtml(post.school)}</span>` : ''}
                        ${post.relation ? `<span class="badge badge-warning">${escapeHtml(post.relation)}</span>` : ''}
                    </div>
                    ${post.aiReason ? `<p class="text-xs text-accent-600 dark:text-accent-400 mt-3 italic flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1"/></svg>
                        ${escapeHtml(post.aiReason)}
                    </p>` : ''}
                </div>
            </div>
        </div>`;
    },

    sortResults() {
        if (!this.currentResults) return;
        const sortBy = document.getElementById('sort-results').value;
        let sorted = [...this.currentResults];
        if (sortBy === 'score') sorted.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));
        else if (sortBy === 'newest') sorted.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        else if (sortBy === 'name') sorted.sort((a, b) => (a.fullName || '').localeCompare(b.fullName || ''));
        this.renderResults(sorted);
    },

    showEmpty() {
        document.getElementById('ai-results')?.classList.add('hidden');
        document.getElementById('ai-empty')?.classList.remove('hidden');
        document.getElementById('ai-loading')?.classList.add('hidden');
    },

    async renderAIInsight(query) {
        const list = document.getElementById('results-list');
        if (!list) return;

        list.innerHTML = `
            <div class="bg-gradient-to-r from-accent-50 to-primary-50 dark:from-accent-900/20 dark:to-primary-900/20 rounded-2xl p-6 border border-accent-100 dark:border-accent-800/30">
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center">
                        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                    </div>
                    <div>
                        <h3 class="font-bold text-gray-900 dark:text-white">AI Insight</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400">Analisis untuk "${escapeHtml(query)}"</p>
                    </div>
                    <div class="ml-auto">
                        <div class="inline-block w-5 h-5 border-2 border-accent-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
                <div id="ai-insight-content" class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    <p class="text-gray-400">AI sedang menganalisis...</p>
                </div>
            </div>`;

        try {
            const insight = await AIEngine.analyzeSearchQuery(query);
            const contentEl = document.getElementById('ai-insight-content');
            if (contentEl && insight) {
                contentEl.innerHTML = insight;
            } else if (contentEl) {
                contentEl.innerHTML = `
                    <p class="mb-2">Tidak ditemukan hasil di database untuk "<strong>${escapeHtml(query)}</strong>".</p>
                    <p class="text-xs text-gray-400 mt-3">Tips:</p>
                    <ul class="text-xs text-gray-400 mt-1 space-y-1 list-disc list-inside">
                        <li>Coba dengan nama lengkap atau nama panggilan</li>
                        <li>Tambahkan lokasi atau kota asal</li>
                        <li>Gunakan ejaan yang berbeda (misal: "Budi" atau "Budy")</li>
                        <li>Masukkan nama sekolah atau tempat kerja</li>
                    </ul>`;
            }
        } catch (err) {
            console.error('AI Insight error:', err);
            const contentEl = document.getElementById('ai-insight-content');
            if (contentEl) {
                contentEl.innerHTML = `<p class="text-gray-400">Gagal menganalisis. Silakan coba kata kunci lain.</p>`;
            }
        }
    },

    currentResults: []
};
