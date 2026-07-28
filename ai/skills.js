// RECONNECT AI Assistant Skills
const AISkills = {

    // ==========================================
    // 1. NAME VARIATIONS DATABASE
    // ==========================================
    nameVariations: {
        'muhammad': ['muhammad', 'mohamad', 'moh.', 'm.', 'muhamad', 'mohammad', 'muhammed', 'mohammad'],
        'mohammad': ['mohammad', 'muhammad', 'moh.', 'm.', 'muhamad', 'mohamad', 'muhammed'],
        'ahmad': ['ahmad', 'ahmed', 'achmad', 'achmad', 'akhmad', 'ahmadi'],
        'ahmed': ['ahmed', 'ahmad', 'achmad', 'akhmad'],
        'abdullah': ['abdullah', 'abdulloh', 'abdulah', 'abdul', 'abdurrahman', 'abdurrohman'],
        'abdul': ['abdul', 'abdullah', 'abdulloh', 'abdurrahman'],
        'muhamad': ['muhamad', 'muhammad', 'mohamad', 'moh.'],
        'andi': ['andi', 'andie', 'andy', 'andika', 'andriansyah', 'andri', 'handi', 'hendi'],
        'budi': ['budi', 'budy', 'budiman', 'budiyono'],
        'dewi': ['dewi', 'dewy', 'dwi', 'dwiyanti'],
        'siti': ['siti', 'sithi', 'syiti', 'sitia'],
        'sri': ['sri', 'sriani', 'suryani'],
        'agus': ['agus', 'agust', 'agusta'],
        'bambang': ['bambang', 'bambang', 'bam'],
        'dwi': ['dwi', 'dewi', 'dwiyanti'],
        'eko': ['eko', 'eeko'],
        'fadli': ['fadli', 'fadly', 'fadhillah', 'fadilah'],
        'galih': ['galih', 'galik'],
        'heri': ['heri', 'heriyanto', 'herman'],
        'irwan': ['irwan', 'irwanto', 'irwan'],
        'joko': ['joko', 'jokowi'],
        'kurniawan': ['kurniawan', 'kurnia'],
        'lina': ['lina', 'lina', 'linda'],
        'mayang': ['mayang', 'mayangsari'],
        'nurul': ['nurul', 'nur'],
        'putri': ['putri', 'putry', 'putrie'],
        'rahman': ['rahman', 'rahman', 'rahmani'],
        'sari': ['sari', 'sari'],
        'toni': ['toni', 'tonny', 'tony'],
        'wati': ['wati', 'waty', 'waton'],
        'yudi': ['yudi', 'yudhi', 'yudhistira'],
        'zainal': ['zainal', 'zainul'],
    },

    // ==========================================
    // 2. SIMILAR NAME DETECTION
    // ==========================================
    generateNameVariations(name) {
        if (!name) return [name];
        const lower = name.toLowerCase().trim();
        const variations = new Set([lower]);

        // Check against known variations
        for (const [key, vars] of Object.entries(this.nameVariations)) {
            if (lower === key || vars.includes(lower)) {
                vars.forEach(v => variations.add(v));
            }
        }

        // Add common prefixes
        const prefixes = ['muhammad', 'moh.', 'm.', 'md.', 'moh'];
        if (prefixes.some(p => lower.startsWith(p))) {
            const base = lower.replace(/^(muhammad|moh\.|m\.|md\.|moh)\s*/i, '').trim();
            if (base) {
                prefixes.forEach(p => variations.add(`${p} ${base}`));
                variations.add(base);
            }
        } else {
            prefixes.forEach(p => variations.add(`${p} ${lower}`));
        }

        // Typo variations (transpositions, missing chars)
        for (let i = 0; i < lower.length - 1; i++) {
            const chars = lower.split('');
            [chars[i], chars[i + 1]] = [chars[i + 1], chars[i]];
            variations.add(chars.join(''));
        }

        // Double letters variation
        for (let i = 0; i < lower.length - 1; i++) {
            if (lower[i] === lower[i + 1]) {
                variations.add(lower.slice(0, i) + lower.slice(i + 1));
            } else {
                variations.add(lower.slice(0, i + 1) + lower[i + 1] + lower.slice(i + 1));
            }
        }

        return [...variations].filter(Boolean);
    },

    // ==========================================
    // 3. CONFIDENCE SCORE BREAKDOWN
    // ==========================================
    calculateConfidence(searchQuery, post) {
        const scores = {
            nama: 0,
            lokasi: 0,
            sekolah: 0,
            deskripsi: 0,
            ciriFisik: 0,
            hubungan: 0,
            total: 0
        };

        const query = searchQuery.toLowerCase();
        const terms = query.split(/\s+/);

        // Name score
        if (post.fullName) {
            const name = post.fullName.toLowerCase();
            const nameVariations = this.generateNameVariations(name);
            const nameMatch = terms.some(t =>
                name.includes(t) ||
                nameVariations.some(v => v.includes(t) || t.includes(v))
            );
            if (nameMatch) scores.nama = 85 + Math.random() * 15;
            else if (terms.some(t => this.fuzzyScore(t, name) > 60)) scores.nama = 60 + Math.random() * 20;
        }

        // Location score
        if (post.city || post.province) {
            const loc = [post.city, post.province, post.country].filter(Boolean).join(' ').toLowerCase();
            if (terms.some(t => loc.includes(t))) scores.lokasi = 80 + Math.random() * 20;
        }

        // School score
        if (post.school || post.university) {
            const edu = [post.school, post.university].filter(Boolean).join(' ').toLowerCase();
            if (terms.some(t => edu.includes(t))) scores.sekolah = 80 + Math.random() * 20;
        }

        // Description score
        if (post.description) {
            const desc = post.description.toLowerCase();
            const matches = terms.filter(t => desc.includes(t)).length;
            if (matches > 0) scores.deskripsi = Math.min(100, 40 + matches * 20);
        }

        // Physical features score
        if (post.physicalFeatures) {
            const features = post.physicalFeatures.toLowerCase();
            if (terms.some(t => features.includes(t))) scores.ciriFisik = 70 + Math.random() * 30;
        }

        // Relationship score
        if (post.relation) {
            const rel = post.relation.toLowerCase();
            if (terms.some(t => rel.includes(t))) scores.hubungan = 80 + Math.random() * 20;
        }

        // Calculate weighted total
        const weights = { nama: 0.3, lokasi: 0.2, sekolah: 0.15, deskripsi: 0.15, ciriFisik: 0.1, hubungan: 0.1 };
        scores.total = Math.round(
            scores.nama * weights.nama +
            scores.lokasi * weights.lokasi +
            scores.sekolah * weights.sekolah +
            scores.deskripsi * weights.deskripsi +
            scores.ciriFisik * weights.ciriFisik +
            scores.hubungan * weights.hubungan
        );

        return scores;
    },

    fuzzyScore(a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
        if (a === b) return 100;
        if (a.includes(b) || b.includes(a)) return 80;
        const len = Math.max(a.length, b.length);
        if (len === 0) return 100;
        let diff = 0;
        for (let i = 0; i < Math.min(a.length, b.length); i++) {
            if (a[i] !== b[i]) diff++;
        }
        diff += Math.abs(a.length - b.length);
        return Math.round((1 - diff / len) * 100);
    },

    // ==========================================
    // 4. AI STORY ANALYSIS
    // ==========================================
    async analyzeStory(text) {
        const prompt = `Analisis cerita/deskripsi pencarian orang berikut:
"${text}"

Ekstrak metadata dalam JSON:
{
  "location": "lokasi/kota yang disebutkan",
  "year": "tahun yang disebutkan",
  "school": "nama sekolah/universitas",
  "workplace": "tempat kerja",
  "relationship": "hubungan (ayah/ibu/saudara/teman/guru/etc)",
  "ageRange": "perkiraan umur jika ada",
  "physicalFeatures": "ciri fisik yang disebutkan",
  "hobby": "hobi yang disebutkan",
  "language": "bahasa yang disebutkan",
  "lastSeen": "terakhir dilihat kapan/dimana",
  "tags": ["tag1", "tag2"],
  "suggestedPostData": {
    "fullName": "nama jika ada",
    "city": "kota",
    "school": "sekolah",
    "relation": "hubungan",
    "physicalFeatures": "ciri fisik"
  }
}
Hanya return JSON. Gunakan null jika tidak ada.`;

        const result = await AIEngine.callGemini(prompt, 1024);
        if (result) {
            return AIEngine._jsonExtract(result);
        }
        return null;
    },

    // ==========================================
    // 5. AI TRANSLATION
    // ==========================================
    async translate(text, targetLang = 'en') {
        const langNames = { en: 'English', id: 'Bahasa Indonesia', ar: 'Arabic', ja: 'Japanese', zh: 'Chinese (Mandarin)' };
        const prompt = `Translate the following text to ${langNames[targetLang] || targetLang}. Return ONLY the translation, no explanations.

Text: "${text}"`;

        const result = await AIEngine.callGemini(prompt, 512);
        return result || text;
    },

    // ==========================================
    // 6. AI AUTO FILL EXTRACTION
    // ==========================================
    async extractPostData(description) {
        const prompt = `Dari deskripsi berikut, ekstrak data untuk membuat posting pencarian orang:
"${description}"

Return JSON:
{
  "fullName": "nama lengkap jika ada",
  "nickname": "nama panggilan jika ada",
  "city": "kota asal/terakhir dilihat",
  "province": "provinsi",
  "school": "sekolah/universitas",
  "workplace": "tempat kerja",
  "relation": "hubungan dengan pelapor",
  "physicalFeatures": "ciri fisik",
  "lastSeenYear": "tahun terakhir bertemu",
  "hobby": "hobi",
  "tags": ["tag1", "tag2"],
  "confidence": "persentase keyakinan ekstraksi 0-100",
  "missingFields": ["field1", "field2"]
}
Hanya return JSON.`;

        const result = await AIEngine.callGemini(prompt, 1024);
        if (result) {
            return AIEngine._jsonExtract(result);
        }
        return null;
    },

    // ==========================================
    // 7. AI EMERGENCY DETECTION
    // ==========================================
    isEmergency(text) {
        if (!text) return false;
        const emergencyKeywords = [
            'anak hilang', 'lansia tersesat', 'darurat', 'urgent', 'emergency',
            'sakit parah', 'kecelakaan', 'tidak ingat', 'amnesia', 'hilang ingatan',
            'bocah', 'balita', 'terpisah', 'mencari sekarang', 'mohon bantu',
            'please help', 'desperate', 'kritis', 'medis'
        ];
        const lower = text.toLowerCase();
        return emergencyKeywords.some(k => lower.includes(k));
    },

    getEmergencyLevel(text) {
        if (!text) return null;
        const lower = text.toLowerCase();
        if (lower.includes('anak hilang') || lower.includes('bocah') || lower.includes('balita') || lower.includes('lansia tersesat')) return 'critical';
        if (lower.includes('darurat') || lower.includes('urgent') || lower.includes('emergency')) return 'high';
        if (lower.includes('sakit') || lower.includes('kecelakaan')) return 'medium';
        return 'low';
    },

    // ==========================================
    // 8. AI CONVERSATION MEMORY
    // ==========================================
    conversationMemory: {
        _key: 'reconnect_ai_memory',

        getHistory(userId) {
            const data = localStorage.getItem(this._key + '_' + userId);
            return data ? JSON.parse(data) : [];
        },

        addEntry(userId, entry) {
            const history = this.getHistory(userId);
            history.push({ ...entry, timestamp: Date.now() });
            if (history.length > 50) history.splice(0, history.length - 50);
            localStorage.setItem(this._key + '_' + userId, JSON.stringify(history));
        },

        getRecentSearches(userId, limit = 10) {
            return this.getHistory(userId)
                .filter(e => e.type === 'search')
                .slice(-limit);
        },

        getRecentPosts(userId, limit = 5) {
            return this.getHistory(userId)
                .filter(e => e.type === 'post_created')
                .slice(-limit);
        },

        clearHistory(userId) {
            localStorage.removeItem(this._key + '_' + userId);
        }
    },

    // ==========================================
    // 9. AI SEARCH INSIGHT
    // ==========================================
    async getSearchInsight(query, posts) {
        const prompt = `Anda adalah asisten AI RECONNECT.

Pencarian: "${query}"
Jumlah data di database: ${posts.length} posting

${posts.length > 0 ? `Sample data:
${posts.slice(0, 5).map(p => `- ${p.fullName || '?'} | ${p.city || '?'} | ${p.description || '?'}`).join('\n')}` : 'Tidak ada data posting di database.'}

Berikan analisis dalam HTML (tanpa script/style):
1. Ringkasan pencarian
2. Tips menemukan orang tersebut
3. Strategi yang disarankan

Bahasa Indonesia. Maksimal 200 kata. Gunakan tag HTML sederhana.`;

        const result = await AIEngine.callGemini(prompt, 1024);
        return result ? result.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim() : null;
    },

    // ==========================================
    // 10. AI SMART FILTER
    // ==========================================
    applySmartFilters(posts, filters) {
        return posts.filter(post => {
            if (filters.query) {
                const terms = filters.query.toLowerCase().split(/\s+/);
                const searchable = [
                    post.fullName, post.nickname, post.description,
                    post.city, post.province, post.school,
                    post.relation, post.physicalFeatures
                ].filter(Boolean).join(' ').toLowerCase();
                const match = terms.some(t => searchable.includes(t) || this.fuzzyMatch(t, searchable));
                if (!match) return false;
            }
            if (filters.city && post.city && !post.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
            if (filters.relation && post.relation && !post.relation.toLowerCase().includes(filters.relation.toLowerCase())) return false;
            if (filters.hasPhoto && !post.photoURL) return false;
            if (filters.emergency && !this.isEmergency(post.description)) return false;
            return true;
        }).map(post => {
            if (filters.query) {
                const scores = this.calculateConfidence(filters.query, post);
                return { ...post, confidenceScores: scores, aiScore: scores.total };
            }
            return post;
        });
    },

    fuzzyMatch(term, text) {
        for (let i = 0; i < text.length - term.length + 1; i++) {
            let diff = 0;
            for (let j = 0; j < term.length; j++) {
                if (term[j] !== text[i + j]) diff++;
            }
            if (diff <= Math.floor(term.length / 3)) return true;
        }
        return false;
    },

    // ==========================================
    // 11. AI INSIGHT DASHBOARD
    // ==========================================
    async getDashboardInsight(posts, searches) {
        const totalPosts = posts.length;
        const emergencyPosts = posts.filter(p => this.isEmergency(p.description)).length;
        const recentPosts = posts.filter(p => {
            const d = new Date(p.createdAt || p.created_at);
            return (Date.now() - d.getTime()) < 86400000;
        }).length;

        const topCities = {};
        posts.forEach(p => {
            if (p.city) topCities[p.city] = (topCities[p.city] || 0) + 1;
        });
        const topLocations = Object.entries(topCities).sort((a, b) => b[1] - a[1]).slice(0, 5);

        const topRelations = {};
        posts.forEach(p => {
            if (p.relation) topRelations[p.relation] = (topRelations[p.relation] || 0) + 1;
        });
        const topRels = Object.entries(topRelations).sort((a, b) => b[1] - a[1]).slice(0, 5);

        return {
            totalPosts,
            emergencyPosts,
            recentPosts,
            topLocations,
            topRelations: topRels,
            searchCount: searches?.length || 0
        };
    }
};
