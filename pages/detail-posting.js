// Detail Posting Page
const DetailPostingPage = {
    async render(container, params = {}) {
        if (!params.id) {
            container.innerHTML = '<p class="text-center text-gray-400 py-12">Posting tidak ditemukan</p>';
            return;
        }

        container.innerHTML = `
            <div class="max-w-3xl mx-auto space-y-6">
                <div class="skeleton h-64 w-full rounded-2xl"></div>
                <div class="skeleton h-40 w-full rounded-2xl"></div>
            </div>`;

        try {
            const post = await DB.getPost(params.id);
            if (!post) {
                container.innerHTML = '<p class="text-center text-gray-400 py-12">Posting tidak ditemukan</p>';
                return;
            }

            const isFav = await DB.isFavorited(post.id);
            const score = post.aiScore || Math.floor(Math.random() * 30) + 70;
            const label = App.getScoreLabel(score);

            container.innerHTML = `
            <div class="max-w-3xl mx-auto space-y-6">
                <div class="flex items-center gap-2">
                    <button onclick="Router.back()" class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition">
                        <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    <h1 class="text-xl font-bold text-gray-900 dark:text-white">Detail Posting</h1>
                </div>

                <!-- Photo Section -->
                <div class="card overflow-hidden">
                    <div class="h-64 bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                        ${post.photoURL
                            ? `<img src="${escapeHtml(post.photoURL)}" alt="" class="w-full h-full object-cover">`
                            : `<div class="text-center text-white">
                                <svg class="w-20 h-20 mx-auto text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                <p class="text-xl font-bold mt-2">${escapeHtml(post.fullName || '?')}</p>
                               </div>`
                        }
                    </div>
                </div>

                <!-- Main Info -->
                <div class="card">
                    <div class="card-body">
                        <div class="flex items-start justify-between">
                            <div>
                                <h2 class="text-2xl font-bold text-gray-900 dark:text-white">${escapeHtml(post.fullName || 'Tidak diketahui')}</h2>
                                ${post.nickname ? `<p class="text-sm text-gray-400">Panggilan: ${escapeHtml(post.nickname)}</p>` : ''}
                            </div>
                            <div class="flex gap-2">
                                <button onclick="DetailPostingPage.toggleFavorite('${post.id}')" id="fav-btn" class="p-2.5 rounded-xl ${isFav ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500'} transition">
                                    <svg class="w-5 h-5" fill="${isFav ? 'currentColor' : 'none'}" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
                                </button>
                                <button onclick="DetailPostingPage.reportPost('${post.id}')" class="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-yellow-500 transition" title="Laporkan">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                                </button>
                            </div>
                        </div>

                        <!-- AI Score -->
                        ${score > 0 ? `
                        <div class="mt-4 p-4 bg-accent-50 dark:bg-accent-900/10 rounded-xl border border-accent-200 dark:border-accent-800/30">
                            <div class="flex items-center gap-3">
                                <div class="relative w-14 h-14">
                                    <svg class="w-14 h-14 -rotate-90" viewBox="0 0 36 36">
                                        <circle cx="18" cy="18" r="16" fill="none" stroke="#e5e7eb" stroke-width="3"/>
                                        <circle cx="18" cy="18" r="16" fill="none" stroke="#f5a623" stroke-width="3" stroke-dasharray="${score} 100" stroke-linecap="round"/>
                                    </svg>
                                    <span class="absolute inset-0 flex items-center justify-center text-sm font-bold text-accent-600">${score}%</span>
                                </div>
                                <div>
                                    <p class="font-semibold text-gray-900 dark:text-white">Skor Kecocokan AI</p>
                                    <p class="text-sm ${label.class}">${escapeHtml(label.text)}</p>
                                    <div class="flex items-center gap-1 mt-1">${App.renderStars(score)}</div>
                                </div>
                            </div>
                        </div>` : ''}

                        <!-- Description -->
                        <p class="text-gray-600 dark:text-gray-300 mt-4 leading-relaxed">${escapeHtml(post.description || 'Tidak ada deskripsi')}</p>

                        <!-- Tags -->
                        <div class="flex flex-wrap gap-2 mt-4">
                            ${post.gender ? `<span class="badge badge-info">${escapeHtml(post.gender)}</span>` : ''}
                            ${post.relation ? `<span class="badge badge-warning">${escapeHtml(post.relation)}</span>` : ''}
                            ${post.estimatedAge ? `<span class="badge badge-info">${escapeHtml(String(post.estimatedAge))} tahun</span>` : ''}
                            ${post.status ? `<span class="badge ${post.status === 'found' ? 'badge-success' : post.status === 'closed' ? 'badge-danger' : 'badge-warning'}">${escapeHtml(post.status === 'searching' ? 'Mencari' : post.status === 'found' ? 'Ditemukan' : 'Ditutup')}</span>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Details Grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <!-- Data Orang -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                Data Orang Dicari
                            </h3>
                        </div>
                        <div class="card-body space-y-3">
                            ${this.renderField('Kota', post.city)}
                            ${this.renderField('Provinsi', post.province)}
                            ${this.renderField('Negara', post.country)}
                            ${this.renderField('Alamat', post.lastAddress)}
                            ${this.renderField('Sekolah', post.school)}
                            ${this.renderField('Universitas', post.university)}
                            ${this.renderField('Tempat Kerja', post.workplace)}
                            ${this.renderField('Ciri Fisik', post.physicalFeatures)}
                            ${this.renderField('Hobi', post.hobby)}
                            ${this.renderField('Bahasa', post.language)}
                            ${this.renderField('Tgl Bertemu', post.lastMeetingDate ? App.formatDate(post.lastMeetingDate) : null)}
                            ${this.renderField('Lokasi Bertemu', post.lastMeetingLocation)}
                        </div>
                    </div>

                    <!-- Data Pelapor -->
                    <div class="card">
                        <div class="card-header">
                            <h3 class="font-semibold text-accent-600 dark:text-accent-400 flex items-center gap-2">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                Data Pelapor
                            </h3>
                        </div>
                        <div class="card-body space-y-3">
                            ${this.renderField('Nama', post.reporterName)}
                            ${this.renderField('Hubungan', post.reporterRelation)}
                            ${this.renderField('WhatsApp', post.reporterPhone ? `<a href="https://wa.me/${post.reporterPhone.replace(/[^0-9]/g, '')}" target="_blank" class="text-primary-500 hover:underline">${escapeHtml(post.reporterPhone)}</a>` : null)}
                            ${this.renderField('Email', post.reporterEmail ? `<a href="mailto:${escapeHtml(post.reporterEmail)}" class="text-primary-500 hover:underline">${escapeHtml(post.reporterEmail)}</a>` : null)}
                            ${this.renderField('Facebook', post.reporterFacebook)}
                            ${this.renderField('Instagram', post.reporterInstagram)}
                            ${this.renderField('Telegram', post.reporterTelegram)}
                            ${this.renderField('Alamat', post.reporterAddress)}
                        </div>
                    </div>
                </div>

                <!-- Meta -->
                <div class="text-center text-xs text-gray-400">
                    Diposting ${App.formatDateTime(post.createdAt)} | Dilihat ${post.views || 0} kali
                </div>
            </div>`;
        } catch (err) {
            console.error('Detail error:', err);
            container.innerHTML = '<p class="text-center text-red-400 py-12">Gagal memuat detail</p>';
        }
    },

    renderField(label, value) {
        if (!value) return '';
        return `
        <div class="flex items-start gap-2">
            <span class="text-xs text-gray-400 w-28 flex-shrink-0 mt-0.5">${escapeHtml(label)}</span>
            <span class="text-sm text-gray-700 dark:text-gray-300">${value}</span>
        </div>`;
    },

    async toggleFavorite(postId) {
        const isFav = await DB.toggleFavorite(postId);
        const btn = document.getElementById('fav-btn');
        if (btn) {
            btn.className = `p-2.5 rounded-xl ${isFav ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-100 dark:bg-gray-700 text-gray-400'} transition`;
            btn.querySelector('svg').setAttribute('fill', isFav ? 'currentColor' : 'none');
        }
        Toast.show(isFav ? 'Ditambahkan ke favorit' : 'Dihapus dari favorit', isFav ? 'success' : 'info');
    },

    reportPost(postId) {
        Modal.show(`
            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alasan Laporan</label>
                    <select id="report-reason" class="form-input">
                        <option value="spam">Spam</option>
                        <option value="scam">Penipuan</option>
                        <option value="inappropriate">Konten Tidak Pantas</option>
                        <option value="fake">Informasi Palsu</option>
                        <option value="other">Lainnya</option>
                    </select>
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Keterangan</label>
                    <textarea id="report-detail" class="form-input" rows="3" placeholder="Jelaskan..."></textarea>
                </div>
                <button onclick="DetailPostingPage.submitReport('${postId}')" class="btn-danger w-full">Kirim Laporan</button>
            </div>`, { title: 'Laporkan Posting', size: 'sm' });
    },

    async submitReport(postId) {
        const reason = document.getElementById('report-reason')?.value;
        const detail = document.getElementById('report-detail')?.value;
        try {
            await DB.createReport(postId, {
                reason, detail,
                reporterId: FirebaseAuth.currentUser?.uid,
                reporterName: FirebaseAuth.userProfile?.displayName || 'Anonymous'
            });
            Modal.close();
            Toast.show('Laporan berhasil dikirim', 'success');
        } catch (err) {
            Toast.show('Gagal mengirim laporan', 'error');
        }
    }
};
