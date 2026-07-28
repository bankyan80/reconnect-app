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
                const score = post.aiScore || null;
                const label = score ? App.getScoreLabel(score) : { text: 'Data baru', class: 'badge-info' };
                return `
                <div class="card hover:shadow-lg transition-all duration-300 overflow-hidden">
                    <div onclick="Router.navigate('detail-posting', {id:'${post.id}'})" class="h-32 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center cursor-pointer overflow-hidden">
                        ${post.photoURL ? `<img src="${escapeHtml(post.photoURL)}" alt="" class="w-full h-full object-cover">` : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-300 to-primary-500"><span class="text-3xl font-bold text-white/80">${escapeHtml((post.fullName || '?')[0]).toUpperCase()}</span></div>`}
                    </div>
                    <div class="p-4">
                        <h3 onclick="Router.navigate('detail-posting', {id:'${post.id}'})" class="font-bold text-gray-900 dark:text-white cursor-pointer hover:text-primary-500 transition">${escapeHtml(post.fullName || 'Tidak diketahui')}</h3>
                        <p class="text-xs text-gray-400 mt-1 line-clamp-2">${escapeHtml(post.description || '')}</p>
                        <div class="flex items-center justify-between mt-3">
                            ${score ? `<div class="flex items-center gap-1">${App.renderStars(score)}</div><span class="text-sm font-bold text-accent-500">${score}%</span>` : '<span class="text-xs text-gray-400">Belum ada skor AI</span>'}
                        </div>
                        <span class="inline-block mt-2 text-xs ${label.class} font-medium">${escapeHtml(label.text)}</span>
                        <div class="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                            <span class="flex items-center gap-1 text-xs text-gray-400">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                ${post.likesCount || 0}
                            </span>
                            <span class="flex items-center gap-1 text-xs text-gray-400">
                                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                                ${post.commentsCount || 0}
                            </span>
                        </div>
                    </div>
                </div>`;
            }).join('');
        } catch (err) {
            console.error('Recommendations error:', err);
            document.getElementById('recommendations').innerHTML = '<p class="col-span-full text-center text-red-400 py-8">Gagal memuat rekomendasi</p>';
        }
    }
};
