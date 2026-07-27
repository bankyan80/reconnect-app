// Bantuan Page
const BantuanPage = {
    render(container) {
        container.innerHTML = `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Bantuan</h1>
                <div class="space-y-4">
                    ${this.renderFAQ('Bagaimana cara mencari orang?', 'Anda bisa menggunakan fitur "Cari Orang" atau "AI Search". Cukup ketik nama, lokasi, sekolah, atau deskripsi orang yang ingin Anda cari. AI akan membantu menemukan kecocokan terbaik.')}
                    ${this.renderFAQ('Bagaimana cara membuat posting?', 'Login terlebih dahulu, lalu klik tombol "Posting Baru". Isi data orang yang Anda cari secara lengkap. Semakin lengkap data yang Anda masukkan, semakin akurat hasil pencarian AI.')}
                    ${this.renderFAQ('Apakah data saya aman?', 'Ya, kami menerapkan keamanan tingkat tinggi termasuk XSS Protection, CSRF Protection, HTTPS, dan Role Based Access Control (RBAC).')}
                    ${this.renderFAQ('Bagaimana AI bekerja?', 'AI kami menggunakan Gemini 2.0 Flash untuk menganalisis data secara real-time. AI mencari berdasarkan nama mirip, typo, ejaan berbeda, lokasi, sekolah, dan konteks lainnya.')}
                    ${this.renderFAQ('Bisakah saya menghapus posting?', 'Ya, Anda bisa menghapus posting yang telah dibuat melalui menu "Posting Saya".')}
                    ${this.renderFAQ('Bagaimana cara menghubungi admin?', 'Silakan kunjungi halaman "Kontak" untuk mengirim pesan kepada kami.')}
                </div>
            </div>`;
    },

    renderFAQ(question, answer) {
        return `
        <div class="card" x-data="{open: false}">
            <button onclick="this.parentElement.classList.toggle('open')" class="w-full flex items-center justify-between p-5 text-left">
                <span class="font-semibold text-gray-900 dark:text-white text-sm">${escapeHtml(question)}</span>
                <svg class="w-5 h-5 text-gray-400 flex-shrink-0 ml-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div class="hidden px-5 pb-5">
                <p class="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">${escapeHtml(answer)}</p>
            </div>
        </div>`;
    }
};

// FAQ toggle script
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.card button');
    if (btn) {
        const card = btn.closest('.card');
        const answer = card.querySelector('.hidden');
        const icon = btn.querySelector('svg');
        if (answer) {
            answer.classList.toggle('hidden');
            icon?.classList.toggle('rotate-180');
        }
    }
});
