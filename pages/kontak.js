// Kontak Page
const KontakPage = {
    render(container) {
        container.innerHTML = `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Kontak</h1>
                <div class="card">
                    <div class="card-body space-y-4">
                        <p class="text-gray-600 dark:text-gray-300 text-sm">Hubungi kami jika Anda memiliki pertanyaan, saran, atau masalah teknis.</p>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nama *</label>
                                <input type="text" id="contact-name" class="form-input" placeholder="Nama Anda" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label>
                                <input type="email" id="contact-email" class="form-input" placeholder="Email Anda" required>
                            </div>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subjek</label>
                            <select id="contact-subject" class="form-input">
                                <option value="general">Pertanyaan Umum</option>
                                <option value="bug">Laporan Bug</option>
                                <option value="feature">Saran Fitur</option>
                                <option value="account">Masalah Akun</option>
                                <option value="other">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pesan *</label>
                            <textarea id="contact-message" class="form-input" rows="5" placeholder="Tuliskan pesan Anda..." required></textarea>
                        </div>
                        <button onclick="KontakPage.submit()" class="btn-primary">Kirim Pesan</button>
                    </div>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="card p-5 text-center">
                        <svg class="w-8 h-8 mx-auto text-primary-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        <h3 class="font-semibold text-gray-900 dark:text-white text-sm">Email</h3>
                        <p class="text-xs text-gray-400 mt-1">support@carikeluarga.ai</p>
                    </div>
                    <div class="card p-5 text-center">
                        <svg class="w-8 h-8 mx-auto text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                        <h3 class="font-semibold text-gray-900 dark:text-white text-sm">WhatsApp</h3>
                        <p class="text-xs text-gray-400 mt-1">+62 812-3456-7890</p>
                    </div>
                    <div class="card p-5 text-center">
                        <svg class="w-8 h-8 mx-auto text-blue-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
                        <h3 class="font-semibold text-gray-900 dark:text-white text-sm">Website</h3>
                        <p class="text-xs text-gray-400 mt-1">www.carikeluarga.ai</p>
                    </div>
                </div>
            </div>`;
    },

    async submit() {
        const name = document.getElementById('contact-name')?.value;
        const email = document.getElementById('contact-email')?.value;
        const subject = document.getElementById('contact-subject')?.value;
        const message = document.getElementById('contact-message')?.value;

        if (!name || !email || !message) {
            Toast.show('Mohon lengkapi semua field wajib', 'warning');
            return;
        }

        try {
            const { error } = await supabase.from('contacts').insert({
                name, email, subject, message,
                created_at: new Date().toISOString()
            });
            if (error) { console.error('Contact submit error:', error); throw error; }
            Toast.show('Pesan berhasil dikirim!', 'success');
            document.getElementById('contact-name').value = '';
            document.getElementById('contact-email').value = '';
            document.getElementById('contact-message').value = '';
        } catch (err) {
            Toast.show('Gagal mengirim pesan', 'error');
        }
    }
};
