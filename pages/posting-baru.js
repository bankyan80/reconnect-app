// Posting Baru Page
const PostingBaruPage = {
    photoFiles: [],
    photoURLs: [],

    async render(container) {
        if (!FirebaseAuth.isLoggedIn()) {
            container.innerHTML = `
                <div class="max-w-lg mx-auto text-center py-20">
                    <svg class="w-16 h-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Login Diperlukan</h2>
                    <p class="text-gray-500 text-sm mb-4">Anda harus login untuk membuat posting</p>
                    <button onclick="Router.navigate('login')" class="btn-primary">Login Sekarang</button>
                </div>`;
            return;
        }

        container.innerHTML = `
            <div class="max-w-3xl mx-auto space-y-6">
                <div>
                    <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Posting Baru</h1>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Isi data orang yang Anda cari</p>
                </div>

                <form id="post-form" onsubmit="PostingBaruPage.submitForm(event)" class="space-y-6">
                    <!-- Data Orang Yang Dicari -->
                    <div class="card">
                        <div class="card-header bg-primary-50 dark:bg-primary-900/20">
                            <h3 class="font-semibold text-primary-600 dark:text-primary-400 flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                Data Orang Yang Dicari
                            </h3>
                        </div>
                        <div class="card-body space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Lengkap *</label>
                                    <input type="text" name="fullName" class="form-input" placeholder="Nama lengkap orang yang dicari" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Panggilan</label>
                                    <input type="text" name="nickname" class="form-input" placeholder="Nama panggilan">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Jenis Kelamin</label>
                                    <select name="gender" class="form-input">
                                        <option value="">Pilih</option>
                                        <option value="Laki-laki">Laki-laki</option>
                                        <option value="Perempuan">Perempuan</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Perkiraan Umur</label>
                                    <input type="number" name="estimatedAge" class="form-input" placeholder="Contoh: 35" min="0" max="150">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Lahir</label>
                                    <input type="date" name="birthDate" class="form-input">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hubungan</label>
                                    <select name="relation" class="form-input">
                                        <option value="">Pilih</option>
                                        <option value="Keluarga">Keluarga</option>
                                        <option value="Saudara Kandung">Saudara Kandung</option>
                                        <option value="Orang Tua">Orang Tua</option>
                                        <option value="Anak">Anak</option>
                                        <option value="Teman Sekolah">Teman Sekolah</option>
                                        <option value="Teman Kuliah">Teman Kuliah</option>
                                        <option value="Sahabat">Sahabat</option>
                                        <option value="Rekan Kerja">Rekan Kerja</option>
                                        <option value="Guru">Guru</option>
                                        <option value="Murid">Murid</option>
                                        <option value="Tetangga">Tetangga</option>
                                        <option value="Lainnya">Lainnya</option>
                                    </select>
                                </div>
                            </div>

                            <!-- Foto -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foto</label>
                                <div class="upload-zone" onclick="document.getElementById('photo-input').click()">
                                    <input type="file" id="photo-input" accept="image/*" multiple class="hidden" onchange="PostingBaruPage.handlePhotos(event)">
                                    <svg class="w-10 h-10 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
                                    <p class="text-sm text-gray-500">Klik untuk upload foto</p>
                                    <p class="text-xs text-gray-400 mt-1">JPG, PNG, WebP (maks. 5MB)</p>
                                </div>
                                <div id="photo-preview" class="flex gap-2 mt-3 flex-wrap"></div>
                            </div>

                            <!-- Lokasi -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kota</label>
                                    <input type="text" name="city" class="form-input" placeholder="Kota">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Provinsi</label>
                                    <input type="text" name="province" class="form-input" placeholder="Provinsi">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Negara</label>
                                    <input type="text" name="country" class="form-input" placeholder="Indonesia" value="Indonesia">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat Terakhir</label>
                                <input type="text" name="lastAddress" class="form-input" placeholder="Alamat terakhir diketahui">
                            </div>

                            <!-- Pendidikan & Pekerjaan -->
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sekolah</label>
                                    <input type="text" name="school" class="form-input" placeholder="Nama sekolah">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Universitas</label>
                                    <input type="text" name="university" class="form-input" placeholder="Nama universitas">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tempat Kerja</label>
                                    <input type="text" name="workplace" class="form-input" placeholder="Tempat kerja">
                                </div>
                            </div>

                            <!-- Kontak (Opsional) -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor Telepon (Opsional)</label>
                                    <input type="tel" name="phone" class="form-input" placeholder="Nomor telepon">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email (Opsional)</label>
                                    <input type="email" name="emailTarget" class="form-input" placeholder="Email">
                                </div>
                            </div>

                            <!-- Ciri Fisik & Lainnya -->
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ciri Fisik</label>
                                    <textarea name="physicalFeatures" class="form-input" rows="2" placeholder="Tinggi, rambut, tanda lahir, dll."></textarea>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hobi</label>
                                    <input type="text" name="hobby" class="form-input" placeholder="Hobi">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bahasa</label>
                                    <input type="text" name="language" class="form-input" placeholder="Bahasa yang dikuasai">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status Posting</label>
                                    <select name="status" class="form-input">
                                        <option value="searching">Mencari</option>
                                        <option value="found">Ditemukan</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi *</label>
                                <textarea id="post-description" name="description" class="form-input" rows="3" placeholder="Deskripsi orang yang dicari. Contoh: Terakhir bertemu di Bandung sekitar tahun 2015. Lulusan SMA Negeri 3." required oninput="PostingBaruPage.checkEmergency(this.value)"></textarea>
                                <div class="flex items-center gap-2 mt-2">
                                    <button type="button" onclick="PostingBaruPage.aiAutoFill()" class="text-xs px-3 py-1.5 bg-accent-100 dark:bg-accent-900/30 text-accent-700 dark:text-accent-300 rounded-lg hover:bg-accent-200 dark:hover:bg-accent-900/50 transition flex items-center gap-1">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                                        AI Auto Fill
                                    </button>
                                    <span id="auto-fill-status" class="text-xs text-gray-400"></span>
                                </div>
                                <div id="emergency-indicator" class="hidden mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                                    <p class="text-xs text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                                        Kasus darurat terdeteksi - akan diprioritaskan
                                    </p>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal Terakhir Bertemu</label>
                                    <input type="date" name="lastMeetingDate" class="form-input">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lokasi Terakhir Bertemu</label>
                                    <input type="text" name="lastMeetingLocation" class="form-input" placeholder="Lokasi terakhir bertemu">
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Data Pelapor -->
                    <div class="card">
                        <div class="card-header bg-accent-50 dark:bg-accent-900/20">
                            <h3 class="font-semibold text-accent-600 dark:text-accent-400 flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                                Data Pelapor
                            </h3>
                        </div>
                        <div class="card-body space-y-4">
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama Pelapor *</label>
                                    <input type="text" name="reporterName" class="form-input" placeholder="Nama Anda" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Hubungan *</label>
                                    <input type="text" name="reporterRelation" class="form-input" placeholder="Hubungan dengan orang yang dicari" required>
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nomor WhatsApp *</label>
                                    <input type="tel" name="reporterPhone" class="form-input" placeholder="08xxx" required>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                    <input type="email" name="reporterEmail" class="form-input" placeholder="email@example.com">
                                </div>
                            </div>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Facebook</label>
                                    <input type="text" name="reporterFacebook" class="form-input" placeholder="URL Facebook">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Instagram</label>
                                    <input type="text" name="reporterInstagram" class="form-input" placeholder="@username">
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telegram</label>
                                    <input type="text" name="reporterTelegram" class="form-input" placeholder="@username">
                                </div>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Alamat</label>
                                <input type="text" name="reporterAddress" class="form-input" placeholder="Alamat Anda">
                            </div>
                        </div>
                    </div>

                    <!-- Submit -->
                    <div class="flex items-center justify-between">
                        <p class="text-xs text-gray-400">* Wajib diisi</p>
                        <div class="flex gap-3">
                            <button type="button" onclick="Router.navigate('dashboard')" class="btn-outline">Batal</button>
                            <button type="submit" id="submit-btn" class="btn-accent flex items-center gap-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                                Kirim Posting
                            </button>
                        </div>
                    </div>
                </form>
            </div>`;
    },

    handlePhotos(event) {
        const files = Array.from(event.target.files);
        this.photoFiles = [...this.photoFiles, ...files].slice(0, 5);
        this.renderPhotoPreviews();
    },

    renderPhotoPreviews() {
        const container = document.getElementById('photo-preview');
        if (!container) return;
        container.innerHTML = this.photoFiles.map((file, i) => {
            const url = URL.createObjectURL(file);
            return `
            <div class="relative w-20 h-20 rounded-xl overflow-hidden group">
                <img src="${url}" class="w-full h-full object-cover">
                <button type="button" onclick="PostingBaruPage.removePhoto(${i})" class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>`;
        }).join('');
    },

    removePhoto(index) {
        this.photoFiles.splice(index, 1);
        this.renderPhotoPreviews();
    },

    checkEmergency(text) {
        const indicator = document.getElementById('emergency-indicator');
        if (!indicator) return;
        if (AISkills.isEmergency(text)) {
            indicator.classList.remove('hidden');
        } else {
            indicator.classList.add('hidden');
        }
    },

    async aiAutoFill() {
        const desc = document.getElementById('post-description')?.value?.trim();
        if (!desc) { Toast.show('Masukkan deskripsi terlebih dahulu', 'warning'); return; }

        const status = document.getElementById('auto-fill-status');
        if (status) status.textContent = 'AI menganalisis...';

        try {
            const data = await AISkills.extractPostData(desc);
            if (!data) { if (status) status.textContent = 'Gagal menganalisis'; return; }

            const form = document.getElementById('post-form');
            if (!form) return;

            const fillField = (name, value) => {
                if (value) {
                    const field = form.querySelector(`[name="${name}"]`);
                    if (field && !field.value) { field.value = value; field.classList.add('ring-2', 'ring-accent-400'); setTimeout(() => field.classList.remove('ring-2', 'ring-accent-400'), 2000); }
                }
            };

            fillField('fullName', data.fullName);
            fillField('nickname', data.nickname);
            fillField('city', data.city);
            fillField('province', data.province);
            fillField('school', data.school);
            fillField('university', data.university);
            fillField('workplace', data.workplace);
            fillField('relation', data.relation);
            fillField('physicalFeatures', data.physicalFeatures);
            fillField('hobby', data.hobby);

            if (status) status.textContent = `Selesai! Keyakinan: ${data.confidence || 0}%`;
            Toast.show('AI Auto Fill berhasil!', 'success');
        } catch (err) {
            console.error('Auto fill error:', err);
            if (status) status.textContent = 'Gagal';
        }
    },

    async forceSubmit() {
        Modal.close();
        const data = PostingBaruPage._pendingData;
        const photoURLs = PostingBaruPage._pendingPhotoURLs;
        if (!data) return;
        try {
            await DB.createPost(data, { force: true });
            Toast.show('Posting berhasil dikirim!', 'success');
            Router.navigate('posting-saya');
        } catch (err) {
            console.error('Force submit error:', err);
            Toast.show('Gagal mengirim posting: ' + err.message, 'error');
        }
        PostingBaruPage._pendingData = null;
        PostingBaruPage._pendingPhotoURLs = null;
    },

    async submitForm(event) {
        event.preventDefault();
        const form = event.target;
        const btn = document.getElementById('submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<div class="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> Mengirim...';

        try {
            const formData = new FormData(form);
            const data = {};
            formData.forEach((val, key) => { if (val) data[key] = val; });

            // AI Spam Detection
            const spamCheck = await AIEngine.detectSpam(data.description || '');
            if (spamCheck.isSpam) {
                Toast.show('Posting Anda terdeteksi sebagai spam. Silakan periksa kembali.', 'error');
                btn.disabled = false;
                btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Kirim Posting';
                return;
            }

            // AI Description Analysis
            if (data.description) {
                const meta = await AIEngine.analyzeDescription(data.description);
                if (meta) {
                    if (!data.city && meta.location) data.city = meta.location;
                    if (meta.school && !data.school) data.school = meta.school;
                    if (meta.workplace && !data.workplace) data.workplace = meta.workplace;
                }
            }

            // Upload photos
            const uploadFolder = `post-${Date.now()}`;
            const photoURLs = [];
            for (const file of this.photoFiles) {
                const url = await FirebaseStorage.uploadImage(file, uploadFolder);
                if (url) photoURLs.push(url);
            }
            data.photoURLs = photoURLs;
            if (photoURLs.length > 0) data.photoURL = photoURLs[0];

            // AI Auto Moderation
            const moderation = await AIEngine.moderatePost(data);
            data.status = moderation.decision === 'approved' ? 'approved' : 'pending';

            const result = await DB.createPost(data);

            if (result.warning) {
                PostingBaruPage._pendingData = data;
                PostingBaruPage._pendingPhotoURLs = photoURLs;
                Modal.show(`
                    <div class="text-center">
                        <svg class="w-16 h-16 mx-auto text-yellow-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"/></svg>
                        <h3 class="font-bold text-lg text-gray-900 dark:text-white mb-2">Peringatan Duplikasi</h3>
                        <p class="text-gray-500 text-sm mb-4">${escapeHtml(result.warning)}</p>
                        <p class="text-gray-400 text-xs mb-4">Posting tetap akan dikirim untuk moderasi.</p>
                        <button onclick="PostingBaruPage.forceSubmit()" class="btn-primary">Kirim Tetap</button>
                    </div>`, { title: 'AI Deteksi Duplikasi' });
            } else {
                Toast.show('Posting berhasil dikirim!', 'success');
                Router.navigate('posting-saya');
            }

            this.photoFiles = [];
            form.reset();
        } catch (err) {
            console.error('Submit error:', err);
            Toast.show('Gagal mengirim posting: ' + err.message, 'error');
        }

        btn.disabled = false;
        btn.innerHTML = '<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg> Kirim Posting';
    }
};
