// RECONNECT Multi-Language System
const I18n = {
    _currentLang: localStorage.getItem('reconnect_lang') || 'id',
    _cache: {},
    _autoTranslate: localStorage.getItem('reconnect_auto_translate') === 'true',

    // ==========================================
    // TRANSLATION DICTIONARIES
    // ==========================================
    translations: {
        id: {
            // Navigation
            'nav.dashboard': 'Dashboard',
            'nav.cari_orang': 'Cari Orang',
            'nav.ai_search': 'AI Search',
            'nav.ai_chat': 'AI Assistant',
            'nav.rekomendasi': 'Rekomendasi AI',
            'nav.posting_baru': 'Posting Baru',
            'nav.posting_saya': 'Posting Saya',
            'nav.favorit': 'Favorit',
            'nav.notifikasi': 'Notifikasi',
            'nav.riwayat': 'Riwayat',
            'nav.moderasi': 'Moderasi',
            'nav.admin': 'Admin Panel',
            'nav.tentang': 'Tentang',
            'nav.bantuan': 'Bantuan',
            'nav.kontak': 'Kontak',
            'nav.location': 'Share Location',
            'nav.login': 'Login',
            'nav.logout': 'Logout',

            // Common
            'common.search': 'Cari',
            'common.loading': 'Memuat...',
            'common.error': 'Terjadi kesalahan',
            'common.success': 'Berhasil',
            'common.cancel': 'Batal',
            'common.save': 'Simpan',
            'common.delete': 'Hapus',
            'common.edit': 'Edit',
            'common.submit': 'Kirim',
            'common.back': 'Kembali',
            'common.next': 'Selanjutnya',
            'common.retry': 'Coba Lagi',
            'common.close': 'Tutup',
            'common.ya': 'Ya',
            'common.tidak': 'Tidak',
            'commonSemua': 'Semua',

            // Dashboard
            'dash.welcome': 'Selamat datang di RECONNECT',
            'dash.belum_ada_posting': 'Belum ada posting',
            'dash.buat_posting': 'Buat Posting Baru',

            // Search
            'search.placeholder': 'Ketik nama, lokasi, sekolah, atau deskripsi...',
            'search.no_results': 'Tidak ada hasil ditemukan',
            'search.hasil_ditemukan': 'hasil ditemukan',
            'search.mulai_pencarian': 'Mulai Pencarian AI',
            'search.deskripsi': 'Ketik nama atau deskripsi untuk mencari',
            'search.analisis': 'AI sedang menganalisis...',
            'search.voice_hint': 'Berbicara sekarang...',

            // Post
            'post.nama_lengkap': 'Nama Lengkap',
            'post.nama_panggilan': 'Nama Panggilan',
            'post.foto': 'Foto',
            'post.foto_wajib': 'Foto (Wajib)',
            'post.foto_hint': 'Klik untuk upload foto',
            'post.foto_format': 'JPG, PNG, WebP (maks. 5MB) - Min. 1 foto',
            'post.foto_error': 'Foto wajib diupload minimal 1',
            'post.kota': 'Kota',
            'post.provinsi': 'Provinsi',
            'post.negara': 'Negara',
            'post.sekolah': 'Sekolah',
            'post.universitas': 'Universitas',
            'post.tempat_kerja': 'Tempat Kerja',
            'post.hubungan': 'Hubungan',
            'post.ciri_fisik': 'Ciri Fisik',
            'post.hobi': 'Hobi',
            'post.deskripsi': 'Deskripsi',
            'post.buat_posting': 'Buat Posting',
            'post.kirim_posting': 'Kirim Posting',
            'post.berhasil': 'Posting berhasil dikirim!',
            'post.gagal': 'Gagal mengirim posting',

            // Profile
            'profile.anggota_sejak': 'Anggota sejak',
            'profile.peran': 'Peran',

            // Auth
            'auth.login_google': 'Login dengan Google',
            'auth.login_hint': 'Masuk dengan akun Google Anda',
            'auth.logout': 'Logout',

            // Location
            'loc.share': 'Share Lokasi',
            'loc.live': 'Live Location',
            'loc.meeting': 'Meeting Point',
            'loc.history': 'Riwayat',
            'loc.sos': 'SOS',
            'loc.verify': 'Verify',
            'loc.trust_score': 'Trust Score',
            'loc.verified': 'Verified Location',
            'loc.recommended': 'Verification Recommended',
            'loc.high_risk': 'High Location Risk',

            // AI
            'ai.analisis': 'AI sedang menganalisis...',
            'ai.insight': 'AI Insight',
            'ai.translate': 'Translate',
            'ai.filter': 'Filter',
            'ai.voice': 'Voice Search',

            // Languages
            'lang.id': 'Bahasa Indonesia',
            'lang.en': 'English',
            'lang.ar': 'Arabic',
            'lang.ja': 'Japanese',
            'lang.zh': 'Chinese',
            'lang.ko': 'Korean',
            'lang.ms': 'Bahasa Melayu',
        },

        en: {
            'nav.dashboard': 'Dashboard',
            'nav.cari_orang': 'Find People',
            'nav.ai_search': 'AI Search',
            'nav.ai_chat': 'AI Assistant',
            'nav.rekomendasi': 'AI Recommendations',
            'nav.posting_baru': 'New Post',
            'nav.posting_saya': 'My Posts',
            'nav.favorit': 'Favorites',
            'nav.notifikasi': 'Notifications',
            'nav.riwayat': 'History',
            'nav.moderasi': 'Moderation',
            'nav.admin': 'Admin Panel',
            'nav.tentang': 'About',
            'nav.bantuan': 'Help',
            'nav.kontak': 'Contact',
            'nav.location': 'Share Location',
            'nav.login': 'Login',
            'nav.logout': 'Logout',

            'common.search': 'Search',
            'common.loading': 'Loading...',
            'common.error': 'An error occurred',
            'common.success': 'Success',
            'common.cancel': 'Cancel',
            'common.save': 'Save',
            'common.delete': 'Delete',
            'common.edit': 'Edit',
            'common.submit': 'Submit',
            'common.back': 'Back',
            'common.next': 'Next',
            'common.retry': 'Try Again',
            'common.close': 'Close',
            'common.ya': 'Yes',
            'common.tidak': 'No',
            'commonSemua': 'All',

            'dash.welcome': 'Welcome to RECONNECT',
            'dash.belum_ada_posting': 'No posts yet',
            'dash.buat_posting': 'Create New Post',

            'search.placeholder': 'Type name, location, school, or description...',
            'search.no_results': 'No results found',
            'search.hasil_ditemukan': 'results found',
            'search.mulai_pencarian': 'Start AI Search',
            'search.deskripsi': 'Type a name or description to search',
            'search.analisis': 'AI is analyzing...',
            'search.voice_hint': 'Speak now...',

            'post.nama_lengkap': 'Full Name',
            'post.nama_panggilan': 'Nickname',
            'post.foto': 'Photo',
            'post.foto_wajib': 'Photo (Required)',
            'post.foto_hint': 'Click to upload photo',
            'post.foto_format': 'JPG, PNG, WebP (max 5MB) - Min. 1 photo',
            'post.foto_error': 'At least 1 photo is required',
            'post.kota': 'City',
            'post.provinsi': 'Province',
            'post.negara': 'Country',
            'post.sekolah': 'School',
            'post.universitas': 'University',
            'post.tempat_kerja': 'Workplace',
            'post.hubungan': 'Relationship',
            'post.ciri_fisik': 'Physical Features',
            'post.hobi': 'Hobby',
            'post.deskripsi': 'Description',
            'post.buat_posting': 'Create Post',
            'post.kirim_posting': 'Submit Post',
            'post.berhasil': 'Post submitted successfully!',
            'post.gagal': 'Failed to submit post',

            'profile.anggota_sejak': 'Member since',
            'profile.peran': 'Role',

            'auth.login_google': 'Login with Google',
            'auth.login_hint': 'Sign in with your Google account',
            'auth.logout': 'Logout',

            'loc.share': 'Share Location',
            'loc.live': 'Live Location',
            'loc.meeting': 'Meeting Point',
            'loc.history': 'History',
            'loc.sos': 'SOS',
            'loc.verify': 'Verify',
            'loc.trust_score': 'Trust Score',
            'loc.verified': 'Verified Location',
            'loc.recommended': 'Verification Recommended',
            'loc.high_risk': 'High Location Risk',

            'ai.analisis': 'AI is analyzing...',
            'ai.insight': 'AI Insight',
            'ai.translate': 'Translate',
            'ai.filter': 'Filter',
            'ai.voice': 'Voice Search',

            'lang.id': 'Bahasa Indonesia',
            'lang.en': 'English',
            'lang.ar': 'Arabic',
            'lang.ja': 'Japanese',
            'lang.zh': 'Chinese',
            'lang.ko': 'Korean',
            'lang.ms': 'Bahasa Melayu',
        },

        ar: {
            'nav.dashboard': 'لوحة التحكم',
            'nav.cari_orang': 'البحث عن أشخاص',
            'nav.ai_search': 'بحث بالذكاء الاصطناعي',
            'nav.ai_chat': 'مساعد الذكاء الاصطناعي',
            'nav.posting_baru': 'منشور جديد',
            'nav.posting_saya': 'منشوراتي',
            'nav.favorit': 'المفضلة',
            'nav.notifikasi': 'الإشعارات',
            'nav.location': 'مشاركة الموقع',
            'nav.login': 'تسجيل الدخول',
            'common.search': 'بحث',
            'common.loading': 'جاري التحميل...',
            'common.cancel': 'إلغاء',
            'common.save': 'حفظ',
            'common.close': 'إغلاق',
            'dash.welcome': 'مرحباً بكم في RECONNECT',
            'search.placeholder': 'اكتب الاسم أو الموقع أو الوصف...',
            'search.no_results': 'لم يتم العثور على نتائج',
            'post.foto': 'صورة',
            'post.foto_wajib': 'صورة (مطلوب)',
            'ai.analisis': 'الذكاء الاصطناعي يحلل...',
        },

        ja: {
            'nav.dashboard': 'ダッシュボード',
            'nav.cari_orang': '人物検索',
            'nav.ai_search': 'AI検索',
            'nav.ai_chat': 'AIアシスタント',
            'nav.posting_baru': '新しい投稿',
            'nav.posting_saya': '自分の投稿',
            'nav.favorit': 'お気に入り',
            'nav.notifikasi': '通知',
            'nav.location': '位置情報共有',
            'nav.login': 'ログイン',
            'common.search': '検索',
            'common.loading': '読み込み中...',
            'common.cancel': 'キャンセル',
            'common.save': '保存',
            'common.close': '閉じる',
            'dash.welcome': 'RECONNECTへようこそ',
            'search.placeholder': '名前、場所、学校、または説明を入力...',
            'search.no_results': '結果が見つかりません',
            'post.foto': '写真',
            'post.foto_wajib': '写真（必須）',
            'ai.analisis': 'AIが分析中...',
        },

        zh: {
            'nav.dashboard': '仪表板',
            'nav.cari_orang': '找人',
            'nav.ai_search': 'AI搜索',
            'nav.ai_chat': 'AI助手',
            'nav.posting_baru': '新帖子',
            'nav.posting_saya': '我的帖子',
            'nav.favorit': '收藏',
            'nav.notifikasi': '通知',
            'nav.location': '位置共享',
            'nav.login': '登录',
            'common.search': '搜索',
            'common.loading': '加载中...',
            'common.cancel': '取消',
            'common.save': '保存',
            'common.close': '关闭',
            'dash.welcome': '欢迎来到 RECONNECT',
            'search.placeholder': '输入姓名、地点、学校或描述...',
            'search.no_results': '未找到结果',
            'post.foto': '照片',
            'post.foto_wajib': '照片（必填）',
            'ai.analisis': 'AI正在分析...',
        },

        ms: {
            'nav.dashboard': 'Papan Pemuka',
            'nav.cari_orang': 'Cari Orang',
            'nav.ai_search': 'Carian AI',
            'nav.ai_chat': 'Pembantu AI',
            'nav.posting_baru': 'Catatan Baru',
            'nav.posting_saya': 'Catatan Saya',
            'nav.favorit': 'Kegemaran',
            'nav.notifikasi': 'Pemberitahuan',
            'nav.location': 'Kongsi Lokasi',
            'nav.login': 'Log Masuk',
            'common.search': 'Cari',
            'common.loading': 'Memuatkan...',
            'common.cancel': 'Batal',
            'common.save': 'Simpan',
            'common.close': 'Tutup',
            'dash.welcome': 'Selamat Datang ke RECONNECT',
            'search.placeholder': 'Taip nama, lokasi, sekolah, atau penerangan...',
            'search.no_results': 'Tiada hasil ditemui',
            'post.foto': 'Foto',
            'post.foto_wajib': 'Foto (Wajib)',
            'ai.analisis': 'AI sedang menganalisis...',
        }
    },

    // ==========================================
    // CORE TRANSLATION
    // ==========================================
    t(key, params = {}) {
        const dict = this.translations[this._currentLang] || this.translations.id;
        let text = dict[key] || this.translations.id[key] || key;
        for (const [k, v] of Object.entries(params)) {
            text = text.replace(`{${k}}`, v);
        }
        return text;
    },

    getLang() { return this._currentLang; },

    setLang(lang) {
        if (!this.translations[lang]) return;
        this._currentLang = lang;
        localStorage.setItem('reconnect_lang', lang);
        document.documentElement.lang = lang;
        this.updatePageTranslations();
        Toast.show(`Language: ${this.t('lang.' + lang)}`, 'success');
    },

    toggleAutoTranslate() {
        this._autoTranslate = !this._autoTranslate;
        localStorage.setItem('reconnect_auto_translate', this._autoTranslate);
        Toast.show(this._autoTranslate ? 'Auto-translate: ON' : 'Auto-translate: OFF', 'info');
    },

    isAutoTranslate() { return this._autoTranslate; },

    // ==========================================
    // AUTO TRANSLATE (via Gemini)
    // ==========================================
    async translateText(text, targetLang) {
        if (!text || !targetLang) return text;
        const cacheKey = `${text}_${targetLang}`;
        if (this._cache[cacheKey]) return this._cache[cacheKey];

        try {
            const langNames = { en: 'English', id: 'Bahasa Indonesia', ar: 'Arabic', ja: 'Japanese', zh: 'Chinese (Mandarin)', ko: 'Korean', ms: 'Bahasa Melayu' };
            const target = langNames[targetLang] || targetLang;
            const prompt = `Translate the following text to ${target}. Return ONLY the translated text, nothing else.

Text: "${text}"`;

            const result = await AIEngine.callGemini(prompt, 512);
            if (result) {
                const translated = result.replace(/[""]/g, '"').trim();
                this._cache[cacheKey] = translated;
                return translated;
            }
        } catch (e) {
            console.error('Translation error:', e);
        }
        return text;
    },

    async autoTranslatePost(post) {
        if (!this._autoTranslate || this._currentLang === 'id') return post;
        const fields = ['fullName', 'nickname', 'description', 'city', 'school', 'physicalFeatures', 'relation'];
        const translated = { ...post };

        for (const field of fields) {
            if (translated[field] && typeof translated[field] === 'string') {
                translated[field] = await this.translateText(translated[field], this._currentLang);
            }
        }
        return translated;
    },

    async autoTranslateContent(text) {
        if (!this._autoTranslate || this._currentLang === 'id') return text;
        return await this.translateText(text, this._currentLang);
    },

    // ==========================================
    // DOM TRANSLATION
    // ==========================================
    updatePageTranslations() {
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });
    },

    // ==========================================
    // LANGUAGE SWITCHER COMPONENT
    // ==========================================
    renderLanguageSwitcher() {
        const langs = [
            { code: 'id', label: '🇮🇩 ID', name: 'Indonesia' },
            { code: 'en', label: '🇺🇸 EN', name: 'English' },
            { code: 'ar', label: '🇸🇦 AR', name: 'العربية' },
            { code: 'ja', label: '🇯🇵 JA', name: '日本語' },
            { code: 'zh', label: '🇨🇳 ZH', name: '中文' },
            { code: 'ms', label: '🇲🇾 MS', name: 'Melayu' }
        ];

        return `
            <div class="relative" id="lang-switcher">
                <button onclick="I18n.toggleLangMenu()" class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition text-sm">
                    <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"/></svg>
                    <span class="text-gray-600 dark:text-gray-300">${langs.find(l => l.code === this._currentLang)?.label || 'ID'}</span>
                </button>
                <div id="lang-menu" class="hidden absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50 min-w-[160px]">
                    ${langs.map(l => `
                        <button onclick="I18n.setLang('${l.code}'); I18n.toggleLangMenu();" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2 ${this._currentLang === l.code ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 font-medium' : 'text-gray-700 dark:text-gray-300'}">
                            <span>${l.label}</span>
                        </button>
                    `).join('')}
                    <div class="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button onclick="I18n.toggleAutoTranslate(); I18n.toggleLangMenu();" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <span class="w-4 h-4 rounded border ${this._autoTranslate ? 'bg-primary-500 border-primary-500' : 'border-gray-300 dark:border-gray-600'} flex items-center justify-center">
                            ${this._autoTranslate ? '<svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/></svg>' : ''}
                        </span>
                        <span>Auto-Translate</span>
                    </button>
                </div>
            </div>`;
    },

    toggleLangMenu() {
        const menu = document.getElementById('lang-menu');
        if (menu) menu.classList.toggle('hidden');
    }
};
