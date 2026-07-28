// Real-Time AI Search Engine
const SearchEngine = {
    debounceTimer: null,
    currentQuery: '',
    unsubscribe: null,

    init(inputElement, resultContainer, options = {}) {
        this.input = inputElement;
        this.container = resultContainer;
        this.options = { debounceMs: 300, useAI: true, limit: 20, ...options };

        this.input.addEventListener('input', (e) => {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.performSearch(e.target.value);
            }, this.options.debounceMs);
        });
    },

    async performSearch(query) {
        this.currentQuery = query.trim();
        if (!this.currentQuery || this.currentQuery.length < 2) {
            this.container.innerHTML = '';
            this.container.classList.add('hidden');
            return;
        }

        this.container.classList.remove('hidden');
        this.container.innerHTML = '<div class="p-4 text-center text-gray-500"><div class="inline-block w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div> Mencari...</div>';

        let results = await this.localSearch(this.currentQuery);

        if (this.options.useAI && results.length > 0) {
            try {
                const aiResults = await AIEngine.search(this.currentQuery, results);
                if (aiResults && aiResults.length > 0) results = aiResults;
            } catch (e) { /* AI search fallback to local */ }
        }

        this.renderResults(results);
    },

    async localSearch(query) {
        const terms = query.toLowerCase().split(/\s+/);
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error || !data) { console.error('Local search error:', error); return []; }

        return data
            .map(row => DB.normalizePost(row))
            .filter(post => {
                const searchable = [
                    post.fullName, post.nickname, post.description,
                    post.city, post.province, post.country,
                    post.school, post.university, post.workplace,
                    post.physicalFeatures, post.reporterName,
                    post.relation, post.hobby, post.language
                ].filter(Boolean).join(' ').toLowerCase();
                return terms.some(term => {
                    return searchable.includes(term) ||
                           this.fuzzyMatch(term, searchable) ||
                           this.soundexMatch(term, searchable);
                });
            })
            .slice(0, this.options.limit);
    },

    fuzzyMatch(term, text) {
        if (text.includes(term)) return true;
        for (let i = 0; i < text.length - term.length + 1; i++) {
            const sub = text.substring(i, i + term.length);
            let diff = 0;
            for (let j = 0; j < term.length; j++) {
                if (term[j] !== sub[j]) diff++;
            }
            if (diff <= Math.floor(term.length / 3)) return true;
        }
        return false;
    },

    soundexMatch(term, text) {
        const getSoundex = (str) => {
            const map = { b:'1', f:'1', p:'1', v:'1', c:'2', g:'2', j:'2', k:'2', q:'2', s:'2', x:'2', z:'2', d:'3', t:'3', l:'4', m:'5', n:'5', r:'6' };
            const first = str[0];
            const rest = str.slice(1).toLowerCase();
            const coded = rest.split('').map(c => map[c] || '0').join('');
            const deduped = coded.replace(/(\d)\1+/g, '$1').replace(/0/g, '');
            return (first.toUpperCase() + deduped + '000').substring(0, 4);
        };
        try {
            const words = text.split(/\s+/).filter(w => w.length > 0);
            const termCode = getSoundex(term);
            return words.some(w => getSoundex(w) === termCode);
        } catch (e) { return false; }
    },

    renderResults(results) {
        if (results.length === 0) {
            this.container.innerHTML = '<div class="p-6 text-center text-gray-500 dark:text-gray-400"><svg class="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg><p class="font-medium">Tidak ada hasil ditemukan</p><p class="text-sm mt-1">Coba kata kunci lain</p></div>';
            return;
        }

        this.container.innerHTML = `
            <div class="py-2">
                <div class="px-4 py-2 text-xs font-semibold text-gray-400 uppercase">${results.length} hasil ditemukan</div>
                ${results.map(post => this.renderResultCard(post)).join('')}
            </div>`;
    },

    renderResultCard(post) {
        const score = post.aiScore || 0;
        const scoreBadge = score > 80 ? 'badge-success' : score > 50 ? 'badge-warning' : 'badge-info';
        const scoreText = score > 0 ? `<span class="badge ${scoreBadge} ml-2">${score}% match</span>` : '';
        const postId = escapeHtml(post.id);

        return `
        <div class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0 transition-colors" onclick="Router.navigate('detail-posting', {id:'${postId}'})">
            <div class="flex items-start gap-3">
                <div class="w-12 h-12 rounded-xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-lg flex-shrink-0 overflow-hidden">
                    ${post.photoURL ? `<img src="${escapeHtml(post.photoURL)}" alt="" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-500"><span class="text-lg font-bold text-white/80">${escapeHtml((post.fullName || 'U')[0]).toUpperCase()}</span></div>`}
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center">
                        <h4 class="font-semibold text-gray-900 dark:text-white text-sm truncate">${escapeHtml(post.fullName || 'Tidak diketahui')}</h4>
                        ${scoreText}
                    </div>
                    ${post.nickname ? `<p class="text-xs text-gray-500 dark:text-gray-400">Panggilan: ${escapeHtml(post.nickname)}</p>` : ''}
                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate">${escapeHtml(post.description || '')}</p>
                    <div class="flex items-center gap-2 mt-1">
                        ${post.city ? `<span class="text-xs text-primary-500 flex items-center gap-1"><svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>${escapeHtml(post.city)}</span>` : ''}
                        ${post.school ? `<span class="text-xs text-gray-400">${escapeHtml(post.school)}</span>` : ''}
                    </div>
                    ${post.aiReason ? `<p class="text-xs text-accent-600 dark:text-accent-400 mt-1 italic">${escapeHtml(post.aiReason)}</p>` : ''}
                </div>
            </div>
        </div>`;
    },

    destroy() {
        clearTimeout(this.debounceTimer);
        if (this.unsubscribe) this.unsubscribe();
    }
};
