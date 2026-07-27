// AI Online Crawler - Fetch & Process Missing Person Data from Online Sources
const AICrawler = {
    isRunning: false,
    lastRun: null,
    logs: [],

    _jsonExtract(text) {
        if (!text) return null;
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        try { return JSON.parse(cleaned); }
        catch (e) { return null; }
    },

    // Search social media for missing person posts
    async searchSocialMedia(query) {
        const searchQueries = [
            `${query} orang hilang instagram`,
            `${query} missing person facebook`,
            `${query} orang dicari twitter`,
            `${query} keluarga terpisah media sosial`,
            `${query} temukan orang hilang`
        ];

        const allResults = [];
        for (const q of searchQueries) {
            try {
                const results = await AIEngine.webSearch(q);
                if (results && results.length > 0) {
                    allResults.push(...results);
                }
            } catch (e) {
                // individual query failure is non-fatal
            }
        }
        return allResults;
    },

    // AI analyze and extract person data from online content
    async analyzeOnlineContent(content) {
        const prompt = `Analisis konten berikut tentang orang hilang. Ekstrak data penting dalam format JSON:
{
    "fullName": "nama lengkap",
    "nickname": "nama panggilan",
    "gender": "Laki-laki/Perempuan",
    "estimatedAge": number,
    "city": "kota terakhir",
    "province": "provinsi",
    "school": "sekolah/universitas",
    "workplace": "tempat kerja",
    "physicalFeatures": "ciri fisik",
    "description": "deskripsi",
    "relation": "hubungan dengan pelapor",
    "source": "sumber asal (url/media)",
    "confidence": number 0-100
}

Konten:
${content.substring(0, 3000)}

Kembalikan HANYA JSON tanpa markdown.`;

        try {
            const result = await AIEngine.callGemini(prompt);
            return this._jsonExtract(result);
        } catch (e) {
            console.error('AI analyze error:', e);
            return null;
        }
    },

    // Verify data from multiple sources
    async verifyData(personData) {
        const prompt = `Verifikasi data orang hilang berikut dari berbagai sumber online:

Data: ${JSON.stringify(personData)}

Tugas verifikasi:
1. Cek konsistensi data (nama, kota, ciri fisik)
2. Cek apakah ada informasi kontradiktif
3. Berikan skor kepercayaan 0-100
4. Jelaskan temuan verifikasi

Format JSON:
{
    "verified": boolean,
    "confidence": number,
    "findings": ["temuan1", "temuan2"],
    "warnings": ["peringatan1"],
    "recommendedActions": ["aksi1"]
}

Kembalikan HANYA JSON tanpa markdown.`;

        try {
            const result = await AIEngine.callGemini(prompt);
            return this._jsonExtract(result) || { verified: false, confidence: 0, findings: [], warnings: ['Gagal memverifikasi'], recommendedActions: [] };
        } catch (e) {
            return { verified: false, confidence: 0, findings: [], warnings: ['Gagal memverifikasi'], recommendedActions: [] };
        }
    },

    // Match with existing posts in database — batch via single AI call
    async matchWithExisting(newData, existingPosts) {
        if (!existingPosts || existingPosts.length === 0) return [];

        const batchSize = 20;
        const allMatches = [];

        for (let i = 0; i < existingPosts.length; i += batchSize) {
            const batch = existingPosts.slice(i, i + batchSize);
            const prompt = `Bandingkan data orang hilang baru berikut dengan database yang ada.
Data Baru: ${JSON.stringify({ fullName: newData.fullName, nickname: newData.nickname, city: newData.city, province: newData.province })}

Database (${batch.length} entries):
${batch.map((p, idx) => `[${i + idx}] ${p.fullName || ''} | ${p.nickname || ''} | ${p.city || ''} | ${p.province || ''} | ${p.school || ''}`).join('\n')}

Berikan JSON array: [{"index": nomor, "score": 0-100, "reason": "alasan", "matchType": "exact/high/medium/low"}]
Hanya untuk yang skor > 50. Hanya return JSON.`;

            try {
                const result = await AIEngine.callGemini(prompt);
                const batchMatches = this._jsonExtract(result);
                if (Array.isArray(batchMatches)) {
                    batchMatches.forEach(m => {
                        const post = existingPosts[m.index];
                        if (post && m.score > 50) {
                            allMatches.push({ ...m, existingPost: post });
                        }
                    });
                }
            } catch (e) {
                continue;
            }
        }

        return allMatches.sort((a, b) => b.score - a.score);
    },

    // Full crawl pipeline
    async runCrawl(searchQuery) {
        if (this.isRunning) {
            Toast.show('Crawl sedang berjalan', 'warning');
            return;
        }

        this.isRunning = true;
        this.addLog('Mulai crawl online data...');

        try {
            // Step 1: Search online sources
            this.addLog('Mencari data dari media sosial...');
            const searchResults = await this.searchSocialMedia(searchQuery);
            this.addLog(`Ditemukan ${searchResults.length} hasil pencarian`);

            if (searchResults.length === 0) {
                this.addLog('Tidak ada data ditemukan');
                this.isRunning = false;
                return { found: 0, posted: 0, matched: 0 };
            }

            // Step 2: Analyze each result with AI
            this.addLog('Menganalisis data dengan AI...');
            const analyzedData = [];
            for (const result of searchResults.slice(0, 10)) {
                const data = await this.analyzeOnlineContent(result.content || result.snippet || result.title);
                if (data && data.fullName) {
                    data.source = result.url || result.link || 'Online';
                    data.searchSource = result.title || '';
                    analyzedData.push(data);
                }
            }

            this.addLog(`Berhasil menganalisis ${analyzedData.length} data`);

            // Step 3: Get existing posts for matching
            const existingPosts = await DB.getAllApprovedPosts(100);

            // Step 4: Process each analyzed data
            let posted = 0;
            let matched = 0;
            const newPosts = [];

            for (const data of analyzedData) {
                // Verify data
                this.addLog(`Memverifikasi: ${data.fullName}...`);
                const verification = await this.verifyData(data);

                if (verification.confidence < 30) {
                    this.addLog(`Ditolak (skor rendah): ${data.fullName}`);
                    continue;
                }

                // Match with existing
                this.addLog(`Mencocokkan: ${data.fullName}...`);
                const matches = await this.matchWithExisting(data, existingPosts);

                if (matches.length > 0 && matches[0].score > 70) {
                    this.addLog(`Cocok dengan posting #${matches[0].existingPost.id} (skor: ${matches[0].score})`);
                    matched++;

                    // Create notification for matching post owner
                    if (matches[0].existingPost.authorId) {
                        await DB.createNotification(matches[0].existingPost.authorId, {
                            title: 'Data Online Cocok!',
                            message: `Ditemukan data online yang cocok dengan "${matches[0].existingPost.fullName}"`,
                            description: `Sumber: ${data.source}. Skor kecocokan: ${matches[0].score}%`,
                            type: 'match'
                        });
                    }
                } else {
                    // Create new post from online data
                    this.addLog(`Membuat posting baru: ${data.fullName}...`);
                    const postData = {
                        fullName: data.fullName,
                        nickname: data.nickname,
                        gender: data.gender,
                        estimatedAge: data.estimatedAge,
                        city: data.city,
                        province: data.province,
                        school: data.school,
                        workplace: data.workplace,
                        physicalFeatures: data.physicalFeatures,
                        description: data.description || `Data ditemukan dari media online: ${data.source}`,
                        reporterName: 'AI Crawler',
                        reporterRelation: 'sistem AI crawling',
                        reporterPhone: '',
                        status: verification.confidence > 70 ? 'approved' : 'pending',
                        ai_score: verification.confidence
                    };

                    try {
                        await DB.createPost(postData);
                        posted++;
                        newPosts.push(postData);
                        this.addLog(`Posting berhasil: ${data.fullName}`);
                    } catch (e) {
                        this.addLog(`Gagal posting: ${data.fullName} - ${e.message}`);
                    }
                }

                // Rate limit
                await new Promise(r => setTimeout(r, 1000));
            }

            this.lastRun = new Date().toISOString();
            this.addLog(`Selesai! ${posted} posting baru, ${matched} cocok dengan data existing`);

            // Save crawl log
            await supabase.from('ai_search_logs').insert({
                query: `[CRAWL] ${searchQuery}`,
                result_count: posted + matched,
                created_at: new Date().toISOString()
            });

            this.isRunning = false;
            return { found: searchResults.length, posted, matched, analyzed: analyzedData.length };

        } catch (err) {
            this.addLog(`Error: ${err.message}`);
            this.isRunning = false;
            throw err;
        }
    },

    addLog(message) {
        const log = {
            time: new Date().toLocaleTimeString('id-ID'),
            message
        };
        this.logs.unshift(log);
        if (this.logs.length > 50) this.logs.pop();

        const logEl = document.getElementById('crawler-logs');
        if (logEl) {
            logEl.innerHTML = this.logs.map(l => `
                <div class="text-xs py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                    <span class="text-gray-400">${l.time}</span>
                    <span class="text-gray-700 dark:text-gray-300 ml-2">${escapeHtml(l.message)}</span>
                </div>
            `).join('');
        }
    },

    // Quick search for specific person
    async quickSearch(name, city) {
        const query = `${name} ${city || ''} orang hilang dicari`;
        this.addLog(`Quick search: ${query}`);
        const results = await this.searchSocialMedia(query);
        const analyzed = [];

        for (const r of results.slice(0, 5)) {
            const data = await this.analyzeOnlineContent(r.content || r.snippet || r.title || '');
            if (data) {
                data.source = r.url || r.link || '';
                analyzed.push(data);
            }
        }

        return analyzed;
    }
};
