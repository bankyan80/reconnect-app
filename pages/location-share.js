// Location Share Page
const LocationSharePage = {
    _shareId: null,
    _liveInterval: null,

    async render(container) {
        if (!FirebaseAuth.isLoggedIn()) {
            container.innerHTML = `<div class="max-w-lg mx-auto text-center py-20">
                <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Login Diperlukan</h2>
                <p class="text-gray-500 text-sm mb-4">Login untuk menggunakan fitur lokasi</p>
                <button onclick="Router.navigate('login')" class="btn-primary">Login Sekarang</button>
            </div>`;
            return;
        }

        container.innerHTML = `
            <div class="max-w-4xl mx-auto space-y-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Share Location</h1>
                        <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Bagikan lokasi Anda dengan aman</p>
                    </div>
                    <button onclick="LocationSharePage.triggerSOS()" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/30 transition flex items-center gap-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                        SOS
                    </button>
                </div>

                <!-- Trust Badge -->
                <div id="trust-badge-card" class="card p-4">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-3">
                            <div id="trust-icon" class="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-gray-100 dark:bg-gray-700">⏳</div>
                            <div>
                                <h3 class="font-semibold text-gray-900 dark:text-white text-sm" id="trust-title">Memverifikasi lokasi...</h3>
                                <p class="text-xs text-gray-400" id="trust-detail">AI sedang menganalisis keaslian lokasi</p>
                            </div>
                        </div>
                        <button onclick="LocationSharePage.verifyMyLocation()" class="text-xs px-3 py-1.5 bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400 rounded-lg hover:bg-primary-100 transition">Verify</button>
                    </div>
                    <div id="trust-details" class="hidden mt-4 grid grid-cols-2 md:grid-cols-4 gap-3"></div>
                </div>

                <!-- Location Map Placeholder -->
                <div class="card overflow-hidden">
                    <div id="location-map" class="h-64 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center relative">
                        <div class="text-center">
                            <svg class="w-12 h-12 mx-auto text-primary-400 dark:text-primary-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                            <p class="text-sm text-primary-600 dark:text-primary-400 font-medium" id="map-status">Klik untuk mendapatkan lokasi</p>
                            <p class="text-xs text-primary-400 mt-1" id="map-coords"></p>
                        </div>
                        <button onclick="LocationSharePage.getLocation()" class="absolute bottom-3 right-3 p-2 bg-white dark:bg-gray-700 rounded-xl shadow-lg hover:shadow-xl transition">
                            <svg class="w-5 h-5 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Actions Grid -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <button onclick="LocationSharePage.shareLocation()" class="card p-4 text-center hover:shadow-lg transition group">
                        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                            <svg class="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                        </div>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">Share Lokasi</p>
                        <p class="text-[10px] text-gray-400 mt-0.5">Bagikan lokasi saat ini</p>
                    </button>
                    <button onclick="LocationSharePage.startLiveShare()" class="card p-4 text-center hover:shadow-lg transition group">
                        <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                            <svg class="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
                        </div>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">Live Location</p>
                        <p class="text-[10px] text-gray-400 mt-0.5">Update real-time</p>
                    </button>
                    <button onclick="LocationSharePage.setMeetingPoint()" class="card p-4 text-center hover:shadow-lg transition group">
                        <div class="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                            <svg class="w-6 h-6 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                        </div>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">Meeting Point</p>
                        <p class="text-[10px] text-gray-400 mt-0.5">Tentukan titik temu</p>
                    </button>
                    <button onclick="LocationSharePage.viewHistory()" class="card p-4 text-center hover:shadow-lg transition group">
                        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition">
                            <svg class="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <p class="text-sm font-semibold text-gray-900 dark:text-white">Riwayat</p>
                        <p class="text-[10px] text-gray-400 mt-0.5">Lokasi sebelumnya</p>
                    </button>
                </div>

                <!-- Active Shares -->
                <div class="card">
                    <div class="card-header"><h3 class="font-semibold text-gray-900 dark:text-white text-sm">Berbagi Lokasi Aktif</h3></div>
                    <div class="card-body" id="active-shares">
                        <p class="text-sm text-gray-400 text-center py-4">Memuat...</p>
                    </div>
                </div>

                <!-- Shared With Me -->
                <div class="card">
                    <div class="card-header"><h3 class="font-semibold text-gray-900 dark:text-white text-sm">Lokasi Dibagikan Kepada Anda</h3></div>
                    <div class="card-body" id="shared-with-me">
                        <p class="text-sm text-gray-400 text-center py-4">Memuat...</p>
                    </div>
                </div>
            </div>`;

        this.loadActiveShares();
        this.loadSharedWithMe();
    },

    async getLocation() {
        const mapStatus = document.getElementById('map-status');
        const mapCoords = document.getElementById('map-coords');
        if (mapStatus) mapStatus.textContent = 'Mendapatkan lokasi...';

        try {
            const pos = await AILocation.getCurrentPosition();
            if (mapStatus) mapStatus.textContent = 'Lokasi ditemukan!';
            if (mapCoords) mapCoords.textContent = `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)} (akurasi: ${Math.round(pos.accuracy)}m)`;
            this._currentPos = pos;
            Toast.show('Lokasi berhasil didapatkan', 'success');
        } catch (err) {
            if (mapStatus) mapStatus.textContent = 'Gagal mendapatkan lokasi';
            Toast.show('Gagal mendapatkan lokasi: ' + err.message, 'error');
        }
    },

    async verifyMyLocation() {
        const title = document.getElementById('trust-title');
        const detail = document.getElementById('trust-detail');
        const icon = document.getElementById('trust-icon');
        const detailsEl = document.getElementById('trust-details');

        if (title) title.textContent = 'Memverifikasi...';
        if (detail) detail.textContent = 'AI sedang menganalisis';

        try {
            if (!this._currentPos) await this.getLocation();
            const result = await AILocation.verifyLocation(this._currentPos);

            if (!result) { Toast.show('Gagal memverifikasi', 'error'); return; }

            const badge = result.trustBadge;
            if (icon) { icon.textContent = badge.icon; icon.className = `w-10 h-10 rounded-xl flex items-center justify-center text-xl ${badge.class}`; }
            if (title) title.textContent = badge.text;
            if (detail) detail.textContent = `Trust Score: ${result.totalScore}%`;

            if (detailsEl) {
                detailsEl.innerHTML = Object.entries(result.checks).map(([key, check]) => `
                    <div class="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div class="flex items-center justify-between">
                            <span class="text-[10px] text-gray-500 dark:text-gray-400">${key.replace(/([A-Z])/g, ' $1')}</span>
                            <span class="text-[10px] font-bold ${check.score >= 80 ? 'text-green-500' : check.score >= 50 ? 'text-yellow-500' : 'text-red-500'}">${check.score}%</span>
                        </div>
                        <p class="text-[10px] text-gray-400 mt-0.5 truncate">${escapeHtml(check.detail)}</p>
                    </div>
                `).join('');
                detailsEl.classList.remove('hidden');
            }

            // Check for fraud
            const fraud = AILocation.detectFraud();
            if (fraud.isFraud) {
                this.showFraudWarning(fraud);
            }

            await AILocation.saveLocationAudit('verify', FirebaseAuth.currentUser.uid, result);
        } catch (err) {
            console.error('Verify error:', err);
            if (title) title.textContent = 'Verifikasi gagal';
        }
    },

    showFraudWarning(fraud) {
        Modal.show(`
            <div class="text-center">
                <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                </div>
                <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">Peringatan Lokasi</h3>
                <p class="text-sm text-gray-500 mb-2">Kami mendeteksi indikasi bahwa lokasi perangkat Anda mungkin dimanipulasi.</p>
                <div class="text-left bg-gray-50 dark:bg-gray-700 rounded-xl p-3 mb-4 max-h-40 overflow-y-auto">
                    ${fraud.anomalies.map(a => `<p class="text-xs text-gray-600 dark:text-gray-300 mb-1">• ${escapeHtml(a.detail)} (${a.severity})</p>`).join('')}
                </div>
                <p class="text-xs text-gray-400 mb-4">Untuk menjaga kepercayaan, fitur Share Location sementara dinonaktifkan.</p>
                <div class="flex gap-2 justify-center">
                    <button onclick="LocationSharePage.verifyMyLocation(); Modal.close();" class="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition">Periksa Lagi</button>
                    <button onclick="Modal.close()" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-300 transition">Tutup</button>
                </div>
            </div>
        `, { title: 'Warning' });
    },

    async shareLocation() {
        if (!this._currentPos) { Toast.show('Dapatkan lokasi terlebih dahulu', 'warning'); return; }
        const trust = await AILocation.verifyLocation(this._currentPos);
        if (trust && trust.riskLevel === 'high') { this.showFraudWarning(ALocation.detectFraud()); return; }

        const result = await AILocation.saveLocationShare(FirebaseAuth.currentUser.uid, {
            ...this._currentPos,
            trustScore: trust?.totalScore,
            isLive: false
        });

        if (result) {
            Toast.show('Lokasi berhasil dibagikan!', 'success');
            this.loadActiveShares();
            AILocation.saveLocationAudit('share', FirebaseAuth.currentUser.uid, { type: 'static', position: this._currentPos });
        } else {
            Toast.show('Gagal membagikan lokasi', 'error');
        }
    },

    async startLiveShare() {
        if (!this._currentPos) { Toast.show('Dapatkan lokasi terlebih dahulu', 'warning'); return; }
        const trust = await AILocation.verifyLocation(this._currentPos);
        if (trust && trust.riskLevel === 'high') { this.showFraudWarning(ALocation.detectFraud()); return; }

        const shareData = { ...this._currentPos, trustScore: trust?.totalScore, isLive: true };
        const success = await AILocation.saveLocationShare(FirebaseAuth.currentUser.uid, shareData);

        if (success) {
            Toast.show('Live Location aktif!', 'success');
            AILocation.startWatching(async (pos) => {
                const shares = await AILocation.getLocationShares(FirebaseAuth.currentUser.uid);
                const liveShare = shares.find(s => s.is_live);
                if (liveShare) await AILocation.updateLocationShare(liveShare.id, pos);
            });
            this.loadActiveShares();
        }
    },

    async setMeetingPoint() {
        if (!this._currentPos) { Toast.show('Dapatkan lokasi terlebih dahulu', 'warning'); return; }

        Modal.show(`
            <div class="space-y-4">
                <h3 class="font-bold text-gray-900 dark:text-white">Tentukan Meeting Point</h3>
                <input type="text" id="meeting-name" placeholder="Nama tempat (contoh: Mall ABC)" class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm outline-none">
                <input type="text" id="meeting-address" placeholder="Alamat atau deskripsi" class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm outline-none">
                <div class="flex gap-2">
                    <button onclick="LocationSharePage.saveMeetingPoint()" class="flex-1 px-4 py-2 bg-primary-500 text-white text-sm rounded-xl hover:bg-primary-600 transition">Simpan</button>
                    <button onclick="Modal.close()" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-xl hover:bg-gray-300 transition">Batal</button>
                </div>
            </div>
        `, { title: 'Meeting Point' });
    },

    async saveMeetingPoint() {
        const name = document.getElementById('meeting-name')?.value?.trim();
        const address = document.getElementById('meeting-address')?.value?.trim();
        if (!name) { Toast.show('Masukkan nama tempat', 'warning'); return; }

        await AILocation.saveLocationShare(FirebaseAuth.currentUser.uid, {
            ...this._currentPos,
            meetingPoint: { name, address, lat: this._currentPos.lat, lng: this._currentPos.lng },
            isLive: false
        });

        Modal.close();
        Toast.show('Meeting point tersimpan!', 'success');
        this.loadActiveShares();
    },

    async triggerSOS() {
        if (!this._currentPos) { Toast.show('Dapatkan lokasi terlebih dahulu', 'warning'); return; }

        Modal.show(`
            <div class="text-center space-y-4">
                <div class="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                    <svg class="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                </div>
                <h3 class="font-bold text-lg text-red-600">KIRIM SOS?</h3>
                <p class="text-sm text-gray-500">Lokasi terakhir Anda akan dikirim ke kontak darurat.</p>
                <input type="text" id="sos-message" placeholder="Pesan (opsional)" class="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white text-sm outline-none" value="Saya butuh bantuan!">
                <div class="flex gap-2">
                    <button onclick="LocationSharePage.sendSOS()" class="flex-1 px-4 py-3 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition">KIRIM SOS</button>
                    <button onclick="Modal.close()" class="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-xl hover:bg-gray-300 transition">Batal</button>
                </div>
            </div>
        `, { title: 'Emergency SOS' });
    },

    async sendSOS() {
        const message = document.getElementById('sos-message')?.value || 'SOS';
        const success = await AILocation.saveSOS(FirebaseAuth.currentUser.uid, {
            lat: this._currentPos.lat,
            lng: this._currentPos.lng,
            message,
            contacts: []
        });

        Modal.close();
        if (success) {
            Toast.show('SOS berhasil dikirim!', 'success');
            AILocation.saveLocationAudit('sos', FirebaseAuth.currentUser.uid, { position: this._currentPos, message });
        } else {
            Toast.show('Gagal mengirim SOS', 'error');
        }
    },

    async loadActiveShares() {
        const el = document.getElementById('active-shares');
        if (!el) return;
        try {
            const shares = await AILocation.getLocationShares(FirebaseAuth.currentUser.uid);
            if (shares.length === 0) {
                el.innerHTML = '<p class="text-sm text-gray-400 text-center py-4">Tidak ada berbagi lokasi aktif</p>';
                return;
            }
            el.innerHTML = shares.map(s => `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-2">
                    <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">${s.is_live ? 'Live' : 'Static'} Location</p>
                        <p class="text-xs text-gray-400">${s.lat?.toFixed(4)}, ${s.lng?.toFixed(4)} &bull; ${App.timeAgo(s.created_at)}</p>
                        ${s.meeting_point ? `<p class="text-xs text-yellow-500">Meeting: ${escapeHtml(s.meeting_point.name || '')}</p>` : ''}
                    </div>
                    <button onclick="LocationSharePage.stopShare('${s.id}')" class="text-xs px-3 py-1.5 bg-red-50 text-red-500 rounded-lg hover:bg-red-100 transition">Stop</button>
                </div>
            `).join('');
        } catch (e) { el.innerHTML = '<p class="text-sm text-gray-400 text-center">Error memuat data</p>'; }
    },

    async loadSharedWithMe() {
        const el = document.getElementById('shared-with-me');
        if (!el) return;
        try {
            const shares = await AILocation.getSharedWithMe(FirebaseAuth.currentUser.uid);
            if (shares.length === 0) {
                el.innerHTML = '<p class="text-sm text-gray-400 text-center py-4">Tidak ada lokasi yang dibagikan kepada Anda</p>';
                return;
            }
            el.innerHTML = shares.map(s => `
                <div class="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-2">
                    <div>
                        <p class="text-sm font-medium text-gray-900 dark:text-white">${escapeHtml(s.user_id?.substring(0, 8) || 'User')}</p>
                        <p class="text-xs text-gray-400">${s.lat?.toFixed(4)}, ${s.lng?.toFixed(4)} &bull; ${App.timeAgo(s.created_at)}</p>
                    </div>
                    <button onclick="AILocation.openNavigation(${s.lat}, ${s.lng}, 'Meeting Point')" class="text-xs px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition flex items-center gap-1">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/></svg>
                        Navigasi
                    </button>
                </div>
            `).join('');
        } catch (e) { el.innerHTML = '<p class="text-sm text-gray-400 text-center">Error memuat data</p>'; }
    },

    async stopShare(shareId) {
        await AILocation.stopLocationShare(shareId);
        Toast.show('Berbagi lokasi dihentikan', 'success');
        this.loadActiveShares();
    },

    viewHistory() {
        const history = AILocation.getPositionHistory();
        if (history.length === 0) { Toast.show('Belum ada riwayat lokasi', 'info'); return; }
        Modal.show(`
            <div class="space-y-2 max-h-60 overflow-y-auto">
                <h3 class="font-bold text-gray-900 dark:text-white mb-2">Riwayat Lokasi</h3>
                ${history.slice(-10).reverse().map(p => `
                    <div class="p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <p class="text-xs text-gray-600 dark:text-gray-300">${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}</p>
                        <p class="text-[10px] text-gray-400">${new Date(p.timestamp).toLocaleString('id-ID')}</p>
                    </div>
                `).join('')}
            </div>
        `, { title: 'Riwayat Lokasi' });
    },

    cleanup() {
        AILocation.stopWatching();
        this._shareId = null;
    }
};
