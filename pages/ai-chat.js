// AI Chat Assistant Page
const AIChatPage = {
    messages: [],
    isTyping: false,

    async render(container) {
        container.innerHTML = `
            <div class="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
                <div class="text-center mb-4">
                    <div class="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl mb-3 shadow-lg">
                        <svg class="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                    </div>
                    <h1 class="text-xl font-bold text-gray-900 dark:text-white">AI Assistant</h1>
                    <p class="text-xs text-gray-500 dark:text-gray-400">Powered by Gemini AI &bull; Bantu Anda mencari orang</p>
                </div>

                <div id="chat-messages" class="flex-1 overflow-y-auto space-y-4 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
                    <div class="flex gap-3">
                        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                        </div>
                        <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm p-4 max-w-[85%]">
                            <p class="text-sm text-gray-800 dark:text-gray-200">Halo! Saya AI Assistant RECONNECT. Saya bisa membantu Anda:</p>
                            <ul class="text-sm text-gray-600 dark:text-gray-300 mt-2 space-y-1 list-disc list-inside">
                                <li>Mencari orang di database kami</li>
                                <li>Membantu membuat posting pencarian</li>
                                <li>Menganalisis cerita Anda untuk metadata</li>
                                <li>Menerjemahkan informasi</li>
                                <li>Memberikan tips pencarian</li>
                            </ul>
                            <p class="text-sm text-gray-800 dark:text-gray-200 mt-2">Ceritakan siapa yang Anda cari:</p>
                        </div>
                    </div>
                </div>

                <div class="flex gap-2 items-end">
                    <div class="flex-1 relative">
                        <textarea id="chat-input" rows="1" placeholder="Ketik pesan atau ceritakan siapa yang Anda cari..." 
                            class="w-full px-4 py-3 pr-12 rounded-2xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-primary-400 focus:border-primary-400 outline-none resize-none transition-all"
                            oninput="AIChatPage.autoResize(this)" onkeydown="if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();AIChatPage.sendMessage()}"></textarea>
                        <button onclick="AIChatPage.toggleVoice()" id="voice-btn" class="absolute right-3 bottom-3 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition text-gray-400 hover:text-primary-500" title="Voice Input">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/></svg>
                        </button>
                    </div>
                    <button onclick="AIChatPage.sendMessage()" class="p-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl transition shadow-md">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
                    </button>
                </div>
            </div>`;

        this.messages = [];
        this.isTyping = false;
        this.setupQuickActions();
    },

    setupQuickActions() {
        const userId = FirebaseAuth.currentUser?.uid;
        if (userId) {
            const memory = AISkills.conversationMemory.getRecentSearches(userId);
            if (memory.length > 0) {
                const chatEl = document.getElementById('chat-messages');
                if (chatEl) {
                    const recentSearches = memory.slice(-3).map(m => m.query).join(', ');
                    const hint = document.createElement('div');
                    hint.className = 'text-center';
                    hint.innerHTML = `<p class="text-xs text-gray-400">Pencarian terakhir: ${escapeHtml(recentSearches)}</p>`;
                    chatEl.appendChild(hint);
                }
            }
        }
    },

    autoResize(el) {
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 120) + 'px';
    },

    async sendMessage() {
        const input = document.getElementById('chat-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text || this.isTyping) return;

        input.value = '';
        input.style.height = 'auto';
        this.addMessage('user', text);

        const userId = FirebaseAuth.currentUser?.uid;
        if (userId) {
            AISkills.conversationMemory.addEntry(userId, { type: 'chat', query: text });
        }

        this.isTyping = true;
        this.addTypingIndicator();

        try {
            const response = await this.processMessage(text);
            this.removeTypingIndicator();
            this.addMessage('ai', response);
        } catch (err) {
            console.error('Chat error:', err);
            this.removeTypingIndicator();
            this.addMessage('ai', 'Maaf, terjadi kesalahan. Silakan coba lagi.');
        }

        this.isTyping = false;
    },

    async processMessage(text) {
        const lower = text.toLowerCase();

        // Check if user wants to create a post
        if (lower.includes('posting') || lower.includes('buat posting') || lower.includes('membuat posting') || lower.includes('daftar')) {
            return await this.handleCreatePost(text);
        }

        // Check if user wants to search
        if (lower.includes('cari') || lower.includes('mencari') || lower.includes('find')) {
            return await this.handleSearch(text);
        }

        // Check if user wants translation
        if (lower.includes('terjemah') || lower.includes('translate') || lower.includes('artinya')) {
            return await this.handleTranslation(text);
        }

        // Check if user wants tips
        if (lower.includes('tips') || lower.includes('saran') || lower.includes('bagaimana') || lower.includes('cara')) {
            return await this.handleTips(text);
        }

        // General story analysis
        return await this.handleGeneralChat(text);
    },

    async handleCreatePost(text) {
        const extracted = await AISkills.extractPostData(text);
        if (extracted) {
            const missingFields = extracted.missingFields || [];
            const isEmergency = AISkills.isEmergency(text);
            const emLevel = AISkills.getEmergencyLevel(text);

            let response = `<p class="text-sm text-gray-800 dark:text-gray-200 mb-3"><strong>Analisis Cerita Anda:</strong></p>`;

            if (extracted.fullName) response += `<p class="text-sm text-gray-700 dark:text-gray-300">Nama: <strong>${escapeHtml(extracted.fullName)}</strong></p>`;
            if (extracted.city) response += `<p class="text-sm text-gray-700 dark:text-gray-300">Lokasi: <strong>${escapeHtml(extracted.city)}</strong></p>`;
            if (extracted.school) response += `<p class="text-sm text-gray-700 dark:text-gray-300">Sekolah: <strong>${escapeHtml(extracted.school)}</strong></p>`;
            if (extracted.relation) response += `<p class="text-sm text-gray-700 dark:text-gray-300">Hubungan: <strong>${escapeHtml(extracted.relation)}</strong></p>`;
            if (extracted.physicalFeatures) response += `<p class="text-sm text-gray-700 dark:text-gray-300">Ciri Fisik: <strong>${escapeHtml(extracted.physicalFeatures)}</strong></p>`;
            if (extracted.confidence) response += `<p class="text-sm text-gray-500 dark:text-gray-400 mt-2">Keyakinan ekstraksi: ${extracted.confidence}%</p>`;

            if (isEmergency) {
                response += `<div class="mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800"><p class="text-sm text-red-600 dark:text-red-400 font-medium">Kasus ${emLevel === 'critical' ? 'KRITIS' : 'DARURAT'} - Postingan akan diprioritaskan</p></div>`;
            }

            if (missingFields.length > 0) {
                response += `<p class="text-sm text-yellow-600 dark:text-yellow-400 mt-2">Data yang perlu dilengkapi: ${missingFields.join(', ')}</p>`;
            }

            response += `<div class="mt-3 flex gap-2">
                <button onclick="AIChatPage.openPostForm(${JSON.stringify(extracted).replace(/"/g, '&quot;')})" class="px-3 py-1.5 bg-primary-500 text-white text-xs rounded-lg hover:bg-primary-600 transition">Buat Posting</button>
                <button onclick="AIChatPage.sendMessageWithContext('Detail tentang ${escapeHtml(extracted.fullName || '')}')" class="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition">Cari di Database</button>
            </div>`;

            return response;
        }

        return `<p class="text-sm text-gray-700 dark:text-gray-300">Saya bisa membantu membuat posting. Ceritakan tentang orang yang Anda cari:</p>
            <ul class="text-sm text-gray-600 dark:text-gray-400 mt-2 space-y-1 list-disc list-inside">
                <li>Nama lengkap atau panggilan</li>
                <li>Lokasi terakhir diketahui</li>
                <li>Sekolah atau tempat kerja</li>
                <li>Hubungan dengan Anda</li>
                <li>Ciri fisik yang Anda ingat</li>
            </ul>`;
    },

    async handleSearch(text) {
        const query = text.replace(/cari|mencari|find|cari\s+/gi, '').trim();
        if (!query) return '<p class="text-sm text-gray-700 dark:text-gray-300">Siapa yang ingin Anda cari? Ketik nama atau deskripsi.</p>';

        try {
            const { data } = await supabase.from('posts').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(50);
            const posts = (data || []).map(row => DB.normalizePost(row));
            const aiResults = await AIEngine.search(query, posts);

            if (aiResults && aiResults.length > 0) {
                let response = `<p class="text-sm text-gray-800 dark:text-gray-200 mb-3"><strong>${aiResults.length} hasil ditemukan untuk "${escapeHtml(query)}":</strong></p>`;
                aiResults.slice(0, 5).forEach(post => {
                    const score = post.aiScore || 0;
                    response += `<div class="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mb-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition" onclick="Router.navigate('detail-posting', {id:'${escapeHtml(post.id)}'})">
                        <div class="flex items-center justify-between">
                            <div>
                                <p class="text-sm font-semibold text-gray-900 dark:text-white">${escapeHtml(post.fullName || 'Tidak diketahui')}</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">${escapeHtml(post.city || '')} ${post.relation ? '&bull; ' + escapeHtml(post.relation) : ''}</p>
                            </div>
                            ${score > 0 ? `<span class="text-sm font-bold text-accent-500">${score}%</span>` : ''}
                        </div>
                        ${post.aiReason ? `<p class="text-xs text-primary-500 dark:text-primary-400 mt-1 italic">${escapeHtml(post.aiReason)}</p>` : ''}
                    </div>`;
                });
                response += `<button onclick="Router.navigate('ai-search')" class="text-xs text-primary-500 hover:text-primary-600 mt-2">Lihat semua hasil di AI Search &rarr;</button>`;
                return response;
            }

            const insight = await AISkills.getSearchInsight(query, posts);
            return insight || '<p class="text-sm text-gray-700 dark:text-gray-300">Tidak ditemukan hasil di database. Coba dengan kata kunci lain atau buat posting baru.</p>';
        } catch (err) {
            return '<p class="text-sm text-red-500">Gagal melakukan pencarian. Silakan coba lagi.</p>';
        }
    },

    async handleTranslation(text) {
        const match = text.match(/(?:terjemah|translate|artinya)\s+(?:ke\s+\w+\s+)?[":'](.+?)[":']|\s+(.+)/i);
        const toTranslate = match ? (match[1] || match[2] || text).trim() : text.replace(/terjemah|translate|artinya/gi, '').trim();
        const translated = await AISkills.translate(toTranslate, 'en');
        return `<p class="text-sm text-gray-700 dark:text-gray-300"><strong>Terjemahan:</strong></p>
            <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">${escapeHtml(translated)}</p>`;
    },

    async handleTips(text) {
        const prompt = `Berikan tips pencarian orang untuk: "${text}"

Bahasa Indonesia. Gunakan tag HTML sederhana (<p>, <strong>, <ul>, <li>). Maksimal 150 kata.`;
        const result = await AIEngine.callGemini(prompt, 512);
        return result ? result.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim() :
            '<p class="text-sm text-gray-700 dark:text-gray-300">Tips: Gunakan nama lengkap, lokasi, dan tahun untuk hasil terbaik.</p>';
    },

    async handleGeneralChat(text) {
        const prompt = `Anda adalah AI Assistant RECONNECT yang membantu menemukan orang hilang/terpisah.

Pesan user: "${text}"

Berikan respons yang membantu dalam Bahasa Indonesia. Gunakan tag HTML sederhana. Maksimal 200 kata.
Jika user bercerita tentang orang yang dicari, bantu analisis dan sarankan cara mencari.`;

        const result = await AIEngine.callGemini(prompt, 1024);
        return result ? result.replace(/```html\n?/g, '').replace(/```\n?/g, '').trim() :
            '<p class="text-sm text-gray-700 dark:text-gray-300">Saya siap membantu Anda mencari orang. Ceritakan detail tentang orang yang Anda cari.</p>';
    },

    addMessage(type, content) {
        const chatEl = document.getElementById('chat-messages');
        if (!chatEl) return;

        const isUser = type === 'user';
        const msg = document.createElement('div');
        msg.className = `flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`;

        if (!isUser) {
            msg.innerHTML = `
                <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
                </div>
                <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm p-4 max-w-[85%]">${content}</div>`;
        } else {
            msg.innerHTML = `
                <div class="bg-primary-500 text-white rounded-2xl rounded-tr-sm p-4 max-w-[85%]">
                    <p class="text-sm">${escapeHtml(content)}</p>
                </div>`;
        }

        chatEl.appendChild(msg);
        chatEl.scrollTop = chatEl.scrollHeight;
        this.messages.push({ type, content });
    },

    addTypingIndicator() {
        const chatEl = document.getElementById('chat-messages');
        if (!chatEl) return;
        const typing = document.createElement('div');
        typing.id = 'typing-indicator';
        typing.className = 'flex gap-3';
        typing.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            </div>
            <div class="bg-gray-100 dark:bg-gray-700 rounded-2xl rounded-tl-sm px-4 py-3">
                <div class="flex gap-1">
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:0ms"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:150ms"></div>
                    <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay:300ms"></div>
                </div>
            </div>`;
        chatEl.appendChild(typing);
        chatEl.scrollTop = chatEl.scrollHeight;
    },

    removeTypingIndicator() {
        const el = document.getElementById('typing-indicator');
        if (el) el.remove();
    },

    openPostForm(data) {
        if (data) {
            sessionStorage.setItem('ai_post_data', JSON.stringify(data));
        }
        Router.navigate('posting-baru');
    },

    sendMessageWithContext(text) {
        const input = document.getElementById('chat-input');
        if (input) {
            input.value = text;
            this.sendMessage();
        }
    },

    // Voice Search
    _recognition: null,
    _isRecording: false,

    toggleVoice() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            Toast.show('Browser tidak mendukung voice input', 'warning');
            return;
        }

        if (this._isRecording) {
            this.stopVoice();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this._recognition = new SpeechRecognition();
        this._recognition.lang = 'id-ID';
        this._recognition.interimResults = true;
        this._recognition.continuous = false;

        this._recognition.onstart = () => {
            this._isRecording = true;
            const btn = document.getElementById('voice-btn');
            if (btn) { btn.classList.add('text-red-500'); btn.classList.add('animate-pulse'); }
            Toast.show('Mendengarkan... Berbicara sekarang', 'info');
        };

        this._recognition.onresult = (event) => {
            const transcript = Array.from(event.results).map(r => r[0].transcript).join('');
            const input = document.getElementById('chat-input');
            if (input) input.value = transcript;
        };

        this._recognition.onend = () => {
            this._isRecording = false;
            const btn = document.getElementById('voice-btn');
            if (btn) { btn.classList.remove('text-red-500'); btn.classList.remove('animate-pulse'); }
        };

        this._recognition.onerror = (e) => {
            this._isRecording = false;
            if (e.error !== 'no-speech') Toast.show('Voice error: ' + e.error, 'error');
        };

        this._recognition.start();
    },

    stopVoice() {
        if (this._recognition) {
            this._recognition.stop();
            this._isRecording = false;
        }
    },

    cleanup() {
        this.stopVoice();
        this.messages = [];
        this.isTyping = false;
    }
};
