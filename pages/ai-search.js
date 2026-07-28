// AI Search Page - Enhanced with Skills
const AISearchPage = {
    _recognition: null,
    _isRecording: false,
    _allPosts: [],

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
                        <input type="text" id="ai-search-input" placeholder="Ketik nama, lokasi, sekolah, atau deskripsi..." class="w-full pl-14 pr-20 py-4 text-lg rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-accent-400 focus:border-accent-400 outline-none transition-all">
                        <div class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                            <button onclick="AISearchPage.toggleVoice()" id="ai-voice-btn" class="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition text-gray-400 hover:text-primary-500" title="Voice Search">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                            </button>
                            <div id="ai-typing" class="hidden">
                                <div class="flex gap-1">
                                    <div class="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style="animation-delay:0ms"></div>
                                    <div class="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style="animation-delay:150ms"></div>
                                    <div class="w-2 h-2 bg-accent-500 rounded-full animate-bounce" style="animation-delay:300ms"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 mt-3">
                        <span class="text-xs text-gray-400 flex items-center gap-1">
                            <svg class="w-4 h-4 text-accent-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            AI menganalisis nama mirip, typo, ejaan berbeda, lokasi, dan konteks
                        </span>
                        <div class="flex gap-1 ml-auto">
                            <button onclick="AISearchPage.translateQuery()" class="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-1" title="Translate">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
                                Translate
                            </button>
                            <button onclick="AISearchPage.smartFilter()" class="text-xs px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition flex items-center gap-1" title="Smart Filter">
                                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
                                Filter
                            </button>
                        </div>
                    </div>

                    <!-- Smart Filters Panel -->
                    <div id="filter-panel" class="hidden mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl space-y-3">
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div>
                                <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Kota</label>
                                <input type="text" id="filter-city" placeholder="Bandung" class="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none">
                            </div>
                            <div>
                                <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Hubungan</label>
                                <select id="filter-relation" class="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none">
                                    <option value="">Semua</option>
                                    <option value="ayah">Ayah</option>
                                    <option value="ibu">Ibu</option>
                                    <option value="saudara">Saudara</option>
                                    <option value="teman">Teman</option>
                                    <option value="guru">Guru</option>
                                    <option value="rekan kerja">Rekan Kerja</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Foto</label>
                                <select id="filter-photo" class="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none">
                                    <option value="">Semua</option>
                                    <option value="true">Ada Foto</option>
                                </select>
                            </div>
                            <div>
                                <label class="text-xs font-medium text-gray-500 dark:text-gray-400">Darurat</label>
                                <select id="filter-emergency" class="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white outline-none">
                                    <option value="">Semua</option>
                                    <option value="true">Kasus Darurat</option>
                                </select>
                            </div>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="AISearchPage.applyFilters()" class="px-3 py-1.5 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600 transition">Terapkan</button>
                            <button onclick="AISearchPage.clearFilters()" class="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition">Reset</button>
                        </div>
                    </div>
                </div>

                <!-- Emergency Banner -->
                <div id="emergency-banner" class="hidden bg-gradient-to-r from-red-500 to-red-600 rounded-2xl p-4 text-white shadow-lg">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                        </div>
                        <div>
                            <h3 class="font-bold text-sm">Kasus Darurat Terdeteksi</h3>
                            <p class="text-xs text-red-100" id="emergency-text">Pencarian ini ditandai sebagai kasus prioritas tinggi</p>
                        </div>
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
                                <option value="confidence">Confidence Detail</option>
                            </select>
                        </div>
                    </div>
                    <div id="results-list" class="space-y-3"></div>
                </div>

                <!-- AI Insight -->
                <div id="ai-insight-container" class="hidden"></div>

                <!-- External AI Knowledge Results -->
                <div id="external-results" class="hidden space-y-4"></div>

                <!-- Empty State -->
                <div id="ai-empty" class="text-center py-12">
                    <svg class="w-20 h-20 mx-auto text-gray-200 dark:text-gray-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                    <h3 class="text-lg font-semibold text-gray-500 dark:text-gray-400">Mulai Pencarian AI</h3>
                    <p class="text-sm text-gray-400 dark:text-gray-500 mt-1">Ketik nama atau deskripsi untuk mencari</p>
                    <div class="flex flex-wrap justify-center gap-2 mt-4">
                        <button onclick="AISearchPage.quickSearch('Andi')" class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 transition">Andi</button>
                        <button onclick="AISearchPage.quickSearch('Bandung')" class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 transition">Bandung</button>
                        <button onclick="AISearchPage.quickSearch('SMA')" class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full hover:bg-primary-100 dark:hover:bg-primary-900/30 transition">SMA</button>
                    </div>
                </div>

                <!-- Loading -->
                <div id="ai-loading" class="hidden text-center py-12">
                    <div class="inline-block w-12 h-12 border-4 border-accent-400 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p class="text-gray-500 dark:text-gray-400 font-medium">AI sedang menganalisis...</p>
                    <p class="text-xs text-gray-400 mt-1">Membandingkan dengan seluruh database</p>
                </div>
            </div>`;

        this.initSearch();
        this.loadAllPosts();
    },

    async loadAllPosts() {
        try {
            const { data } = await supabase.from('posts').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(200);
            this._allPosts = (data || []).map(row => DB.normalizePost(row));
        } catch (e) { /* silent */ }
    },

    initSearch() {
        const input = document.getElementById('ai-search-input');
        let timer;
        input.addEventListener('input', (e) => {
            clearTimeout(timer);
            const val = e.target.value.trim();
            if (val.length >= 2) {
                document.getElementById('ai-typing').classList.remove('hidden');
                timer = setTimeout(() => this.performSearch(val), 400);
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

        const saved = sessionStorage.getItem('ai_search_query');
        if (saved) {
            input.value = saved;
            sessionStorage.removeItem('ai_search_query');
            this.performSearch(saved);
        }
    },

    quickSearch(query) {
        const input = document.getElementById('ai-search-input');
        if (input) { input.value = query; this.performSearch(query); }
    },

    async loadExternalKnowledge(query, localPosts) {
        const externalEl = document.getElementById('external-results');
        if (!externalEl) return;
        externalEl.innerHTML = `
            <div class="card p-5 border-dashed border-2 border-accent-200 dark:border-accent-800/50">
                <div class="flex items-center gap-3 mb-3">
                    <div class="w-8 h-8 bg-accent-100 dark:bg-accent-900/30 rounded-lg flex items-center justify-center">
                        <div class="w-4 h-4 border-2 border-accent-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <div>
                        <h4 class="font-semibold text-gray-900 dark:text-white text-sm">AI Knowledge Search</h4>
                        <p class="text-xs text-gray-400">Mencari informasi dari berbagai sumber...</p>
                    </div>
                </div>
            </div>`;
        externalEl.classList.remove('hidden');

        try {
            const [externalPosts, knowledgeHtml] = await Promise.all([
                AIEngine.searchCrossReference(query, localPosts),
                AIEngine.searchExternalKnowledge(query)
            ]);

            let html = '';

            // External knowledge results from AI
            if (externalPosts && externalPosts.length > 0) {
                html += `
                    <div class="card p-5 border border-accent-100 dark:border-accent-800/30">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-xl flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-900 dark:text-white">Hasil dari Pengetahuan AI</h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Informasi dari berbagai sumber pengetahuan</p>
                            </div>
                        </div>
                        <div class="space-y-3">
                            ${externalPosts.map(post => `
                                <div class="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-700">
                                    <div class="flex items-start justify-between gap-3">
                                        <div class="flex-1">
                                            <div class="flex items-center gap-2">
                                                <h4 class="font-semibold text-gray-900 dark:text-white">${escapeHtml(post.fullName || 'Tidak diketahui')}</h4>
                                                ${post.city ? `<span class="badge badge-info text-[10px]">${escapeHtml(post.city)}</span>` : ''}
                                                <span class="text-[10px] px-2 py-0.5 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-full">${escapeHtml(post.source || 'AI')}</span>
                                            </div>
                                            <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">${escapeHtml(post.description || '')}</p>
                                            ${post.aiReason ? `<p class="text-xs text-accent-600 dark:text-accent-400 mt-2 italic">💡 ${escapeHtml(post.aiReason)}</p>` : ''}
                                        </div>
                                        <div class="text-right flex-shrink-0">
                                            <div class="text-lg font-bold text-accent-500">${post.aiScore}%</div>
                                            <div class="text-[10px] text-gray-400">confidence</div>
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>`;
            }

            // External knowledge HTML
            if (knowledgeHtml) {
                html += `
                    <div class="card p-5 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 border border-blue-100 dark:border-blue-800/30">
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                            </div>
                            <div>
                                <h3 class="font-bold text-gray-900 dark:text-white">Informasi dari Berbagai Sumber</h3>
                                <p class="text-xs text-gray-500 dark:text-gray-400">Analisis AI berdasarkan pengetahuan umum</p>
                            </div>
                        </div>
                        <div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">${knowledgeHtml}</div>
                    </div>`;
            }

            if (html) {
                externalEl.innerHTML = html;
            } else {
                externalEl.innerHTML = `
                    <div class="card p-4 text-center">
                        <p class="text-sm text-gray-400">Tidak ada informasi tambahan ditemukan dari sumber eksternal</p>
                    </div>`;
            }
        } catch (err) {
            console.error('External search error:', err);
            externalEl.innerHTML = `
                <div class="card p-4 text-center">
                    <p class="text-sm text-gray-400">Gagal memuat informasi dari sumber eksternal</p>
                </div>`;
        }
    },

    async performSearch(query) {
        const loading = document.getElementById('ai-loading');
        const results = document.getElementById('ai-results');
        const empty = document.getElementById('ai-empty');
        const insightContainer = document.getElementById('ai-insight-container');

        loading.classList.remove('hidden');
        results.classList.add('hidden');
        empty.classList.add('hidden');
        if (insightContainer) insightContainer.classList.add('hidden');

        // Emergency detection
        if (AISkills.isEmergency(query)) {
            const banner = document.getElementById('emergency-banner');
            const text = document.getElementById('emergency-text');
            if (banner) {
                banner.classList.remove('hidden');
                const level = AISkills.getEmergencyLevel(query);
                text.textContent = level === 'critical' ? 'Kasus Kritis: Anak/lansia hilang - Diprioritaskan' : 'Kasus Darurat: Ditandai untuk perhatian khusus';
            }
        } else {
            const banner = document.getElementById('emergency-banner');
            if (banner) banner.classList.add('hidden');
        }

        try {
            let posts = this._allPosts;
            if (posts.length === 0) {
                const { data } = await supabase.from('posts').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(200);
                posts = (data || []).map(row => DB.normalizePost(row));
                this._allPosts = posts;
            }

            // Name variation search
            const variations = AISkills.generateNameVariations(query);
            let localResults = posts.filter(post => {
                const searchable = [
                    post.fullName, post.nickname, post.description,
                    post.city, post.province, post.country,
                    post.school, post.university, post.workplace,
                    post.physicalFeatures, post.relation, post.hobby
                ].filter(Boolean).join(' ').toLowerCase();
                return variations.some(v => searchable.includes(v)) ||
                       query.toLowerCase().split(/\s+/).some(term => searchable.includes(term) || AISkills.fuzzyMatch(term, searchable));
            });

            // AI scoring
            localResults = localResults.map(post => {
                const confidence = AISkills.calculateConfidence(query, post);
                return { ...post, aiScore: confidence.total, confidenceScores: confidence };
            });

            // AI enhanced scoring via Gemini
            let aiResults = await AIEngine.search(query, posts);
            if (aiResults && aiResults.length > 0) {
                const aiIds = new Set(aiResults.map(r => r.id));
                aiResults.forEach(r => {
                    const localIdx = localResults.findIndex(l => l.id === r.id);
                    if (localIdx >= 0) {
                        localResults[localIdx].aiScore = Math.max(localResults[localIdx].aiScore || 0, r.aiScore || 0);
                        localResults[localIdx].aiReason = r.aiReason;
                    } else {
                        localResults.push(r);
                    }
                });
            }

            // Merge and dedupe
            const seen = new Set();
            localResults = localResults.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
            localResults.sort((a, b) => (b.aiScore || 0) - (a.aiScore || 0));

            this.currentResults = localResults;
            this.renderResults(localResults);

            // External AI Knowledge Search (parallel)
            this.loadExternalKnowledge(query, posts);

            // AI Insight
            if (localResults.length === 0) {
                const insight = await AISkills.getSearchInsight(query, posts);
                if (insight && insightContainer) {
                    insightContainer.innerHTML = `
                        <div class="bg-gradient-to-r from-accent-50 to-primary-50 dark:from-accent-900/20 dark:to-primary-900/20 rounded-2xl p-6 border border-accent-100 dark:border-accent-800/30">
                            <div class="flex items-center gap-3 mb-4">
                                <div class="w-10 h-10 bg-accent-500 rounded-xl flex items-center justify-center">
                                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                                </div>
                                <div>
                                    <h3 class="font-bold text-gray-900 dark:text-white">AI Insight</h3>
                                    <p class="text-xs text-gray-500 dark:text-gray-400">Analisis untuk "${escapeHtml(query)}"</p>
                                </div>
                            </div>
                            <div class="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">${insight}</div>
                        </div>`;
                    insightContainer.classList.remove('hidden');
                }
            } else if (insightContainer) {
                insightContainer.innerHTML = '';
                insightContainer.classList.add('hidden');
            }

            // Conversation memory
            const userId = FirebaseAuth.currentUser?.uid;
            if (userId) {
                AISkills.conversationMemory.addEntry(userId, { type: 'search', query, resultCount: localResults.length });
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
        const cs = post.confidenceScores;
        const isEmergency = AISkills.isEmergency(post.description);

        return `
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 cursor-pointer ${isEmergency ? 'ring-2 ring-red-400 dark:ring-red-600' : ''}" onclick="Router.navigate('detail-posting', {id:'${escapeHtml(post.id)}'})">
            <div class="flex items-start gap-4">
                <div class="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-bold text-xl flex-shrink-0 overflow-hidden">
                    ${post.photoURL ? `<img src="${escapeHtml(post.photoURL)}" alt="" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-500"><span class="text-2xl font-bold text-white/80">${escapeHtml((post.fullName || '?')[0]).toUpperCase()}</span></div>`}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2">
                        <div>
                            <h3 class="font-bold text-gray-900 dark:text-white text-lg">${escapeHtml(post.fullName || 'Tidak diketahui')}</h3>
                            ${post.nickname ? `<p class="text-xs text-gray-400">Panggilan: ${escapeHtml(post.nickname)}</p>` : ''}
                        </div>
                        <div class="text-right flex-shrink-0">
                            ${score > 0 ? `<div class="text-2xl font-bold text-accent-500">${score}%</div><p class="text-xs ${label.class} font-medium">${escapeHtml(label.text)}</p>` : ''}
                            ${isEmergency ? '<span class="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">DARURAT</span>' : ''}
                        </div>
                    </div>
                    <div class="flex items-center gap-1 mt-1">${stars}</div>
                    <p class="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">${escapeHtml(post.description || 'Tidak ada deskripsi')}</p>

                    ${cs ? `
                    <div class="mt-3 grid grid-cols-3 gap-2">
                        ${cs.nama > 0 ? `<div class="text-center"><div class="text-xs font-bold text-primary-500">${Math.round(cs.nama)}%</div><div class="text-[10px] text-gray-400">Nama</div></div>` : ''}
                        ${cs.lokasi > 0 ? `<div class="text-center"><div class="text-xs font-bold text-blue-500">${Math.round(cs.lokasi)}%</div><div class="text-[10px] text-gray-400">Lokasi</div></div>` : ''}
                        ${cs.sekolah > 0 ? `<div class="text-center"><div class="text-xs font-bold text-green-500">${Math.round(cs.sekolah)}%</div><div class="text-[10px] text-gray-400">Sekolah</div></div>` : ''}
                        ${cs.deskripsi > 0 ? `<div class="text-center"><div class="text-xs font-bold text-yellow-500">${Math.round(cs.deskripsi)}%</div><div class="text-[10px] text-gray-400">Deskripsi</div></div>` : ''}
                        ${cs.ciriFisik > 0 ? `<div class="text-center"><div class="text-xs font-bold text-purple-500">${Math.round(cs.ciriFisik)}%</div><div class="text-[10px] text-gray-400">Ciri Fisik</div></div>` : ''}
                        ${cs.hubungan > 0 ? `<div class="text-center"><div class="text-xs font-bold text-pink-500">${Math.round(cs.hubungan)}%</div><div class="text-[10px] text-gray-400">Hubungan</div></div>` : ''}
                    </div>` : ''}

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
        else if (sortBy === 'confidence') sorted.sort((a, b) => (b.confidenceScores?.total || 0) - (a.confidenceScores?.total || 0));
        this.renderResults(sorted);
    },

    showEmpty() {
        document.getElementById('ai-results')?.classList.add('hidden');
        document.getElementById('ai-empty')?.classList.remove('hidden');
        document.getElementById('ai-loading')?.classList.add('hidden');
        document.getElementById('ai-insight-container')?.classList.add('hidden');
        document.getElementById('emergency-banner')?.classList.add('hidden');
    },

    // Voice Search
    toggleVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            Toast.show('Browser tidak mendukung voice search', 'warning');
            return;
        }
        if (this._isRecording) { this.stopVoice(); return; }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this._recognition = new SpeechRecognition();
        this._recognition.lang = 'id-ID';
        this._recognition.interimResults = true;
        this._recognition.continuous = false;

        this._recognition.onstart = () => {
            this._isRecording = true;
            const btn = document.getElementById('ai-voice-btn');
            if (btn) { btn.classList.add('text-red-500', 'animate-pulse'); }
            Toast.show('Mendengarkan...', 'info');
        };

        this._recognition.onresult = (event) => {
            const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
            const input = document.getElementById('ai-search-input');
            if (input) input.value = transcript;
        };

        this._recognition.onend = () => {
            this._isRecording = false;
            const btn = document.getElementById('ai-voice-btn');
            if (btn) { btn.classList.remove('text-red-500', 'animate-pulse'); }
            const input = document.getElementById('ai-search-input');
            if (input && input.value.trim().length >= 2) this.performSearch(input.value.trim());
        };

        this._recognition.onerror = (e) => {
            this._isRecording = false;
            if (e.error !== 'no-speech') Toast.show('Voice error: ' + e.error, 'error');
        };

        this._recognition.start();
    },

    stopVoice() {
        if (this._recognition) { this._recognition.stop(); this._isRecording = false; }
    },

    // Translate
    async translateQuery() {
        const input = document.getElementById('ai-search-input');
        if (!input || !input.value.trim()) return;
        Toast.show('Menerjemahkan...', 'info');
        const translated = await AISkills.translate(input.value.trim(), 'en');
        if (translated) {
            input.value = translated;
            this.performSearch(translated);
        }
    },

    // Smart Filter
    smartFilter() {
        const panel = document.getElementById('filter-panel');
        if (panel) panel.classList.toggle('hidden');
    },

    applyFilters() {
        const filters = {
            query: document.getElementById('ai-search-input')?.value?.trim(),
            city: document.getElementById('filter-city')?.value?.trim(),
            relation: document.getElementById('filter-relation')?.value,
            hasPhoto: document.getElementById('filter-photo')?.value === 'true',
            emergency: document.getElementById('filter-emergency')?.value === 'true'
        };
        const filtered = AISkills.applySmartFilters(this._allPosts, filters);
        this.currentResults = filtered;
        this.renderResults(filtered);
    },

    clearFilters() {
        ['filter-city', 'filter-relation', 'filter-photo', 'filter-emergency'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = '';
        });
        const q = document.getElementById('ai-search-input')?.value?.trim();
        if (q) this.performSearch(q);
    },

    cleanup() {
        this.stopVoice();
        this._allPosts = [];
    },

    currentResults: []
};
