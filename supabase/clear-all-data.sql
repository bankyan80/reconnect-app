-- Hapus semua data simulasi/dummy dari database RECONNECT
-- Jalankan di Supabase Dashboard > SQL Editor

-- Hapus semua posts (data simulasi, AI-generated, dan user posts)
DELETE FROM posts;

-- Reset sequence ID (opsional, untuk mulai dari 1 lagi)
-- ALTER SEQUENCE posts_id_seq RESTART WITH 1;

-- Verifikasi
SELECT 'Semua data berhasil dihapus' as status, COUNT(*) as sisa_data FROM posts;
