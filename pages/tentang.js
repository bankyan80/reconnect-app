// Tentang Page
const TentangPage = {
    render(container) {
        container.innerHTML = `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Tentang</h1>
                <div class="card">
                    <div class="card-body space-y-4">
                        <div class="text-center py-6">
                            <div class="w-20 h-20 bg-accent-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto shadow-lg">RN</div>
                            <h2 class="text-xl font-bold text-gray-900 dark:text-white mt-4">RECONNECT</h2>
                            <p class="text-sm text-gray-500 dark:text-gray-400">Versi 3.0 Enterprise</p>
                        </div>
                        <div class="prose prose-sm max-w-none text-gray-600 dark:text-gray-300">
                            <p><strong>RECONNECT</strong> adalah platform sosial berbasis kecerdasan buatan yang membantu masyarakat menemukan kembali anggota keluarga, teman sekolah, sahabat, rekan kerja, maupun kerabat yang telah lama terpisah.</p>
                            <p>Berbeda dengan aplikasi pencarian biasa, sistem ini memanfaatkan <strong>Artificial Intelligence (AI)</strong> untuk membantu menemukan kecocokan berdasarkan berbagai informasi yang dimasukkan pengguna, bukan hanya nama.</p>
                            <h3>Fitur Utama</h3>
                            <ul>
                                <li><strong>Real-Time AI Search</strong> - Pencarian cerdas dengan analisis kecocokan</li>
                                <li><strong>AI Matching</strong> - Skor kecocokan berbasis AI</li>
                                <li><strong>AI Recommendation</strong> - Rekomendasi orang yang mungkin Anda cari</li>
                                <li><strong>AI Moderation</strong> - Moderasi otomatis untuk menjaga kualitas</li>
                                <li><strong>AI Spam Detection</strong> - Deteksi spam dan penipuan</li>
                            </ul>
                            <h3>Teknologi</h3>
                            <p>Didukung oleh <strong>Gemini 2.0 Flash</strong> sebagai mesin AI, <strong> Firebase</strong> untuk backend, dan <strong>Tailwind CSS</strong> untuk antarmuka yang responsif.</p>
                            <h3>Versi</h3>
                            <p><strong>v3.0 Enterprise</strong> - AI Search, AI Matching, AI Recommendation, AI Moderation, Dashboard, PWA, Dark Mode</p>
                            <p><strong>v4.0 (Coming Soon)</strong> - Face Recognition, Voice Search, OCR, Multi Bahasa, Google Maps, WhatsApp Business API</p>
                        </div>
                    </div>
                </div>
            </div>`;
    }
};
