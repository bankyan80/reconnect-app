// Gemini AI Engine
const AIEngine = {
    // WARNING: API keys in client-side code can be viewed in DevTools.
    // For production, proxy requests through a serverless function.
    // Load keys from config/api-keys.js (gitignored) or fallback to Firebase key
    API_KEYS: (typeof GEMINI_API_KEYS !== 'undefined' && GEMINI_API_KEYS.length > 0)
        ? GEMINI_API_KEYS
        : ['AIzaSyD3tB4hQKIoUp8K__mv_EkR1TXBpcIgW_Q'],
    currentKeyIndex: 0,
    failedKeys: new Set(),
    BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models',
    available: true,
    MODEL: 'gemini-1.5-flash',

    getNextKey() {
        for (let i = 0; i < this.API_KEYS.length; i++) {
            const idx = (this.currentKeyIndex + i) % this.API_KEYS.length;
            if (!this.failedKeys.has(idx)) {
                this.currentKeyIndex = (idx + 1) % this.API_KEYS.length;
                return this.API_KEYS[idx];
            }
        }
        this.failedKeys.clear();
        const key = this.API_KEYS[0];
        this.currentKeyIndex = 1;
        return key;
    },

    _jsonExtract(text) {
        if (!text) return null;
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        try { return JSON.parse(cleaned); }
        catch (e) { return null; }
    },

    async callGemini(prompt, maxTokens = 2048) {
        if (!this.available) return null;

        const key = this.getNextKey();
        try {
            const response = await fetch(`${this.BASE_URL}/${this.MODEL}:generateContent?key=${key}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 }
                })
            });

            if (response.status === 429) {
                const failedIdx = (this.currentKeyIndex - 1 + this.API_KEYS.length) % this.API_KEYS.length;
                this.failedKeys.add(failedIdx);
                if (this.failedKeys.size < this.API_KEYS.length) {
                    return this.callGemini(prompt, maxTokens);
                }
                setTimeout(() => { this.failedKeys.clear(); this.available = true; }, 60000);
                this.available = false;
                Toast.show('Semua kuota AI habis. Coba lagi dalam 60 detik.', 'warning');
                return null;
            }

            if (!response.ok) throw new Error(`API error: ${response.status}`);
            const data = await response.json();
            return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        } catch (err) {
            console.error('Gemini API error:', err);
            return null;
        }
    },

    // AI Search - Analisis kecocokan
    async search(query, posts) {
        if (!this.available || !query.trim()) return this.fallbackSearch(query, posts);

        const prompt = `Analisis pencarian orang berikut: "${query}"
        
Data postingan yang tersedia:
${posts.slice(0, 20).map((p, i) => `[${i+1}] ${p.fullName || ''} - ${p.nickname || ''} | ${p.city || ''}, ${p.province || ''} | ${p.school || ''} | ${p.description || ''} | Ciri: ${p.physicalFeatures || ''}`).join('\n')}

Berdasarkan input "${query}", berikan JSON array hasil pencarian dengan format:
[{"index": nomor, "score": persentase 0-100, "reason": "alasan kecocokan", "matchedFields": ["field1","field2"]}]

Analisis: nama mirip, typo, ejaan berbeda, lokasi, sekolah, deskripsi, ciri fisik.
Hanya return JSON, tanpa teks lain.`;

        const result = await this.callGemini(prompt);
        if (result) {
            const matches = this._jsonExtract(result);
            if (matches) {
                await DB.logAISearch({ query, resultCount: matches.length, userId: FirebaseAuth.currentUser?.uid });
                return matches.map(m => ({
                    ...posts[m.index - 1],
                    aiScore: m.score,
                    aiReason: m.reason,
                    matchedFields: m.matchedFields
                })).filter(Boolean);
            }
            console.error('JSON parse error in search');
            return this.fallbackSearch(query, posts);
        }
        return this.fallbackSearch(query, posts);
    },

    // AI Web Search
    async webSearch(query) {
        if (!this.available) return [];

        const prompt = `Cari informasi online tentang: "${query}"

Untuk setiap hasil yang relevan tentang orang hilang atau dicari, kembalikan JSON array:
[{"title": "judul/heading", "snippet": "ringkasan informasi", "url": "url jika ada", "content": "konten lengkap"}]

Jika tidak ada hasil relevan, return array kosong [].
Hanya return JSON.`;

        try {
            const result = await this.callGemini(prompt, 2048);
            if (!result) return [];
            const parsed = this._jsonExtract(result);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error('Web search error:', e);
            return [];
        }
    },

    // AI External Knowledge Search - Search for information about a person from various sources
    async searchExternalKnowledge(query) {
        if (!this.available || !query.trim()) return null;

        const prompt = `Anda adalah AI pencari orang untuk platform RECONNECT. Seseorang mencari: "${query}"

Tugas Anda adalah mencari informasi terbaru dan relevan dari berbagai sumber:

1. **Informasi Terbaru**: Cari berita, informasi terkini tentang orang/tempat yang dicari. Jika ada berita baru tentang orang hilang atau ditemukan di wilayah terkait, sertakan.
2. **Informasi Umum Nama**: Jika nama tersebut umum di Indonesia, jelaskan asal-usul, arti, variasi nama, dan demografi pemakai nama tersebut
3. **Konteks Lokasi**: Jika disebutkan kota/daerah, berikan informasi terkini tentang lokasi tersebut
4. **Tips Pencarian Spesifik**: Strategi pencarian yang efektif berdasarkan informasi yang tersedia
5. **Sumber Daya Terbaru**: Sarankan sumber daya terkini yang bisa membantu:
   - Komunitas Facebook aktif tentang pencarian orang
   - Grup WhatsApp yang relevan
   - Forum online dan media sosial
   - Organisasi pencari orang (Yayasan, NGO)
   - Kantor kelurahan, RT/RW, kecamatan
   - Media sosial dan platform digital
6. **Kemungkinan Pola**: Analisis pola berdasarkan tahun/sekolah/hubungan
7. **Berita dan Kabar Terkini**: Jika ada informasi terbaru tentang pencarian orang di wilayah tersebut, sertakan

Format dalam HTML (tanpa script/style). Gunakan tag: <div>, <p>, <strong>, <em>, <ul>, <li>, <h4>, <span>.
Buat dalam Bahasa Indonesia. Informatif, praktis, dan terkini. Maksimal 500 kata.`;

        const result = await this.callGemini(prompt, 2048);
        if (result) {
            return result.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
        }
        return null;
    },

    // AI Cross-Reference Search - Search across multiple dimensions with latest info
    async searchCrossReference(query, localPosts) {
        if (!this.available || !query.trim()) return [];

        const localContext = localPosts.length > 0
            ? `\nData di database lokal (${localPosts.length} posting):\n${localPosts.slice(0, 10).map((p, i) => `[${i+1}] ${p.fullName || ''} | ${p.city || ''} | ${p.description || ''}`).join('\n')}`
            : '\nTidak ada data di database lokal.';

        const prompt = `Analisis pencarian orang: "${query}"
${localContext}

Tugas Anda:
1. Analisis nama dan variasinya
2. Cari informasi terkini yang relevan dari pengetahuan umum
3. Jika ada konteks lokasi/tahun/sekolah, berikan informasi terbaru
4. Buat posting potensial dari informasi yang ditemukan

Kembalikan JSON array hasil analisis (maksimal 5):
[{
    "fullName": "nama yang mungkin dicari",
    "city": "kota terkait jika ada",
    "province": "provinsi jika ada",
    "school": "sekolah jika ada",
    "description": "informasi terbaru dari pengetahuan umum dan sumber data",
    "relation": "hubungan jika ada",
    "physicalFeatures": "ciri fisik jika ada",
    "source": "sumber informasi (contoh: 'Berita Terkini', 'Pengetahuan Umum AI', 'Analisis Nama', 'Konteks Lokasi', 'Data Komunitas')",
    "confidence": 0-100,
    "reason": "alasan mengapa ini relevan dengan pencarian",
    "latestInfo": "informasi terbaru yang ditemukan"
}]

Jika tidak ada yang relevan, return array kosong [].
Hanya return JSON.`;

        try {
            const result = await this.callGemini(prompt, 2048);
            if (!result) return [];
            const parsed = this._jsonExtract(result);
            if (!Array.isArray(parsed)) return [];

            return parsed.map(item => ({
                id: 'ai-external-' + Math.random().toString(36).substr(2, 9),
                fullName: item.fullName || '',
                city: item.city || '',
                province: item.province || '',
                school: item.school || '',
                description: item.latestInfo || item.description || '',
                relation: item.relation || '',
                physicalFeatures: item.physicalFeatures || '',
                source: item.source || 'AI Knowledge',
                aiScore: item.confidence || 50,
                aiReason: item.reason || '',
                isExternal: true,
                photoURL: null,
                created_at: new Date().toISOString()
            }));
        } catch (e) {
            console.error('Cross-reference search error:', e);
            return [];
        }
    },

    // AI Matching Score
    async getMatchScore(personData, targetData) {
        const prompt = `Bandingkan dua data orang berikut dan berikan skor kecocokan:
        
Data 1: ${JSON.stringify(personData)}
Data 2: ${JSON.stringify(targetData)}

Berikan JSON dengan format:
{"totalScore": 0-100, "scores": {"nama": 0-100, "lokasi": 0-100, "sekolah": 0-100, "umur": 0-100, "ciri": 0-100}, "reason": "alasan"}
Hanya return JSON.`;

        const result = await this.callGemini(prompt, 512);
        if (result) {
            const parsed = this._jsonExtract(result);
            if (parsed) return parsed;
        }
        return null;
    },

    // AI Rekomendasi
    async getRecommendations(post, allPosts) {
        const prompt = `Berdasarkan posting berikut, rekomendasikan 5 orang paling mirip dari database:
        
Posting: ${post.fullName || ''} | ${post.description || ''} | ${post.city || ''} | ${post.school || ''}

Database:
${allPosts.slice(0, 30).map((p, i) => `[${i}] ${p.fullName || ''} | ${p.city || ''} | ${p.school || ''} | ${p.description || ''}`).join('\n')}

Berikan JSON array: [{"index": nomor, "similarity": 0-100, "reason": "alasan"}]
Hanya return JSON.`;

        const result = await this.callGemini(prompt);
        if (result) {
            const recs = this._jsonExtract(result);
            if (recs) {
                return recs.map(r => ({ ...allPosts[r.index], similarity: r.similarity, reason: r.reason })).filter(Boolean);
            }
        }
        return [];
    },

    // AI Spam Detection
    async detectSpam(text, images = []) {
        const prompt = `Analisis konten berikut untuk deteksi spam, penipuan, atau konten berbahaya:

Teks: "${text}"

Berikan JSON: {"isSpam": true/false, "confidence": 0-100, "category": "safe/spam/scam/inappropriate", "reason": "alasan"}
Hanya return JSON.`;

        const result = await this.callGemini(prompt, 256);
        if (result) {
            const parsed = this._jsonExtract(result);
            if (parsed) return parsed;
        }
        return { isSpam: false, confidence: 0, category: 'safe', reason: 'AI unavailable' };
    },

    // AI Moderator
    async moderatePost(post) {
        const prompt = `Evaluasi posting pencarian orang berikut:

Nama: ${post.fullName}
Deskripsi: ${post.description}
Lokasi: ${post.city}, ${post.province}
Foto: ${post.photoURL ? 'Ada' : 'Tidak ada'}
Pelapor: ${post.reporterName}

Rekomendasikan: "approved" (layak publikasi), "review" (perlu ditinjau), atau "rejected" (ditolak).
Berikan JSON: {"decision": "approved/review/rejected", "reason": "alasan"}
Hanya return JSON.`;

        const result = await this.callGemini(prompt, 256);
        if (result) {
            const parsed = this._jsonExtract(result);
            if (parsed) return parsed;
        }
        return { decision: 'review', reason: 'AI evaluation failed' };
    },

    // AI Search Insight - Analisis query pencarian
    async analyzeSearchQuery(query) {
        const prompt = `Anda adalah asisten AI untuk platform RECONNECT yang membantu menemukan orang hilang/terpisah.

Seseorang mencari: "${query}"

Berikan analisis yang informatif dan membantu dalam format HTML (tanpa <script>, <style>, atau tag berbahaya lainnya). Sertakan:

1. Kemungkinan identitas/orang yang dicari berdasarkan nama/informasi
2. Tips spesifik untuk menemukan orang tersebut
3. Strategi pencarian yang efektif
4. Platform atau komunitas yang bisa membantu

Gunakan HTML sederhana: <p>, <strong>, <em>, <ul>, <li>, <br>.
Buat dalam Bahasa Indonesia, ramah, dan informatif. Maksimal 300 kata.`;

        const result = await this.callGemini(prompt, 1024);
        if (result) {
            return result.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim();
        }
        return null;
    },

    // AI Auto Complete
    async autoComplete(partialName) {
        if (!partialName || partialName.length < 2) return [];
        const prompt = `Lengkapi nama berikut dengan 6 kemungkinan nama Indonesia yang umum:
"${partialName}"

Termasuk variasi typo dan ejaan. Berikan JSON array string: ["nama1", "nama2", ...]
Hanya return JSON.`;

        const result = await this.callGemini(prompt, 256);
        if (result) {
            const parsed = this._jsonExtract(result);
            if (parsed) return parsed;
        }
        return [];
    },

    // AI Analisis Deskripsi
    async analyzeDescription(description) {
        const prompt = `Ekstrak metadata dari deskripsi berikut:
"${description}"

Berikan JSON: {"location": "lokasi jika ada", "year": "tahun jika ada", "school": "sekolah jika ada", "workplace": "tempat kerja jika ada", "relationship": "hubungan jika ada", "physicalFeatures": "ciri fisik jika ada"}
Hanya return JSON. Gunakan null jika tidak ada.`;

        const result = await this.callGemini(prompt, 256);
        if (result) {
            const parsed = this._jsonExtract(result);
            if (parsed) return parsed;
        }
        return null;
    },

    // Duplicate Check
    async checkDuplicate(newPost) {
        const existingPosts = await DB.getPosts({ status: 'approved', limit: 50 });
        const prompt = `Cek apakah posting baru ini duplikat dari posting yang sudah ada:

Posting Baru: ${newPost.fullName} | ${newPost.city} | ${newPost.description} | ${newPost.reporterPhone || ''}

Posting yang sudah ada:
${existingPosts.slice(0, 20).map((p, i) => `[${i}] ${p.fullName} | ${p.city} | ${p.description} | ${p.reporterPhone || ''}`).join('\n')}

Berikan JSON: {"isDuplicate": true/false, "similarIndex": nomor atau -1, "confidence": 0-100}
Hanya return JSON.`;

        const result = await this.callGemini(prompt, 256);
        if (result) {
            const data = this._jsonExtract(result);
            if (data) return data.isDuplicate && data.confidence > 70;
        }
        return false;
    },

    // Fallback Search (tanpa AI)
    fallbackSearch(query, posts = []) {
        if (!query || !posts.length) return [];
        const terms = query.toLowerCase().split(/\s+/);
        return posts.filter(post => {
            const searchable = [
                post.fullName, post.nickname, post.description,
                post.city, post.province, post.country,
                post.school, post.university, post.workplace,
                post.physicalFeatures, post.reporterName
            ].filter(Boolean).join(' ').toLowerCase();
            return terms.every(term => searchable.includes(term));
        }).map(p => ({ ...p, aiScore: 0, aiReason: 'Pencarian lokal (AI tidak tersedia)' }));
    }
};
