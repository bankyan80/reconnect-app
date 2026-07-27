// Supabase Storage Operations
const STORAGE_BUCKET = 'posts';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const FirebaseStorage = {
    async uploadImage(file, folder = 'temp') {
        if (!file) return null;
        if (file.size > MAX_FILE_SIZE) {
            Toast.show('Ukuran file maksimal 5MB', 'error');
            return null;
        }
        if (!ALLOWED_TYPES.includes(file.type)) {
            Toast.show('Hanya file JPG, PNG, dan WebP', 'error');
            return null;
        }

        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
        const filePath = `${folder}/${fileName}`;

        try {
            const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
                cacheControl: '3600', upsert: false
            });

            if (error) {
                console.error('Storage upload error:', error);
                Toast.show('Gagal upload gambar', 'error');
                return null;
            }

            const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath);
            return publicUrl;
        } catch (err) {
            console.error('Storage error:', err);
            return null;
        }
    },

    async deleteImage(url) {
        if (!url) return;
        try {
            const path = url.split(`/storage/v1/object/public/${STORAGE_BUCKET}/`)[1];
            if (path) {
                await supabase.storage.from(STORAGE_BUCKET).remove([path]);
            }
        } catch (err) {
            console.error('Delete image error:', err);
        }
    }
};
