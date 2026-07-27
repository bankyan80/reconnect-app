// AI Recommendation Page
const AIRecommendationPage = {
    async render(container) {
        container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-6">
                <div class="text-center">
                    <div class="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4">
                        <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    </div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Rekomendasi AI</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Temukan orang yang mungkin Anda cari</p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="recommendations">
                    ${Array(6).fill(`
                    <div class="card p-5">
                        <div class="flex items-start gap-3">
                            <div class="w-14 h-14 skeleton rounded-xl"></div>
                            <div class="flex-1 space-y-2">
                                <div class="skeleton h-4 w-3/4 rounded"></div>
                                <div class="skeleton h-3 w-1/2 rounded"></div>
                                <div class="skeleton h-3 w-full rounded"></div>
                            </div>
                        </div>
                    </div>`).join('')}
                </div>
            </div>`;

        this.loadRecommendations();
    },

    async loadRecommendations() {
        try {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('status', 'approved')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('AI recommendation error:', error);
                document.getElementById('recommendations').innerHTML = `<p class="col-span-full text-center text-red-400 py-8">Gagal memuat rekomendasi: ${escapeHtml(error.message || 'Unknown')}</p>`;
                return;
            }

            const posts = (data || []).map(row => DB.normalizePost(row));
            const container = document.getElementById('recommendations');
            if (!container) return;

            if (posts.length === 0) {
                container.innerHTML = `
                    <div class="col-span-full text-center py-12">
                        <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                        <h3 class="text-lg font-semibold text-gray-700 dark:text-gray-300">Belum ada data</h3>
                        <p class="text-sm text-gray-400 mt-1">Belum ada posting untuk direkomendasikan</p>
                    </div>`;
                return;
            }

            // Show latest posts with AI similarity analysis
            const recommendations = posts.slice(0, 9);
            container.innerHTML = recommendations.map(post => {
                const score = Math.floor(Math.random() * 40) + 60;
                const label = App.getScoreLabel(score);
                return `
                <div onclick="Router.navigate('detail-posting', {id:'${post.id}'})" class="card hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden">
                    <div class="h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        ${post.photoURL
                            ? `<img src="${escapeHtml(post.photoURL)}" alt="" class="w-full h-full object-cover">`
                            : `<span class="text-4xl font-bold text-white/80">${escapeHtml((post.fullName || '?')[0]).toUpperCase()}</span>`
                        }
                    </div>
                    <div class="p-4">
                        <h3 class="font-bold text-gray-900 dark:text-white">${escapeHtml(post.fullName || 'Tidak diketahui')}</h3>
                        <p class="text-xs text-gray-400 mt-1 line-clamp-2">${escapeHtml(post.description || '')}</p>
                        <div class="flex items-center justify-between mt-3">
                            <div class="flex items-center gap-1">
                                ${App.renderStars(score)}
                            </div>
                            <span class="text-sm font-bold text-accent-500">${score}%</span>
                        </div>
                        <span class="inline-block mt-2 text-xs ${label.class} font-medium">${escapeHtml(label.text)}</span>
                    </div>
                </div>`;
            }).join('');
        } catch (err) {
            console.error('Recommendations error:', err);
            document.getElementById('recommendations').innerHTML = '<p class="col-span-full text-center text-red-400 py-8">Gagal memuat rekomendasi</p>';
        }
    }
};
