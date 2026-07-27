// Supabase Database Operations
const DB = {
    // ===== POSTS =====
    async createPost(data) {
        const post = {
            author_id: FirebaseAuth.currentUser?.uid || null,
            author_name: data.reporterName || 'Anonymous',
            full_name: data.fullName,
            nickname: data.nickname || null,
            gender: data.gender || null,
            estimated_age: data.estimatedAge ? parseInt(data.estimatedAge) : null,
            birth_date: data.birthDate || null,
            relation: data.relation || null,
            photo_url: data.photoURL || null,
            photo_urls: data.photoURLs || [],
            city: data.city || null,
            province: data.province || null,
            country: data.country || 'Indonesia',
            last_address: data.lastAddress || null,
            school: data.school || null,
            university: data.university || null,
            workplace: data.workplace || null,
            phone: data.phone || null,
            email_target: data.emailTarget || null,
            physical_features: data.physicalFeatures || null,
            hobby: data.hobby || null,
            language: data.language || null,
            description: data.description,
            last_meeting_date: data.lastMeetingDate || null,
            last_meeting_location: data.lastMeetingLocation || null,
            reporter_name: data.reporterName,
            reporter_relation: data.reporterRelation,
            reporter_phone: data.reporterPhone,
            reporter_email: data.reporterEmail || null,
            reporter_facebook: data.reporterFacebook || null,
            reporter_instagram: data.reporterInstagram || null,
            reporter_telegram: data.reporterTelegram || null,
            reporter_address: data.reporterAddress || null,
            status: data.status || 'pending',
            ai_score: data.ai_score || 0,
            ai_analysis: data.ai_analysis || null,
            views: 0,
            favorites: 0
        };

        const isDuplicate = await AIEngine.checkDuplicate(post);
        if (isDuplicate) {
            return { warning: 'Mungkin Anda sedang membuat posting yang sama.', data: post };
        }

        const { data: result, error } = await supabase.from('posts').insert(post).select().single();
        if (error) { console.error('Create post error:', error); throw error; }
        await AuditLog.log('create_post', { postId: result.id, authorId: post.author_id });
        return result;
    },

    async updatePost(postId, data) {
        const mapped = {};
        if (data.status !== undefined) mapped.status = data.status;
        if (data.views !== undefined) mapped.views = data.views;
        if (data.favorites !== undefined) mapped.favorites = data.favorites;
        if (data.ai_score !== undefined) mapped.ai_score = data.ai_score;
        mapped.updated_at = new Date().toISOString();

        const { error } = await supabase.from('posts').update(mapped).eq('id', postId);
        if (error) { console.error('Update post error:', error); throw error; }
        await AuditLog.log('update_post', { postId });
    },

    async deletePost(postId) {
        // Client-side auth check: only post author or admin/moderator can delete
        const post = await this.getPost(postId);
        if (!post) throw new Error('Post not found');
        const uid = FirebaseAuth.currentUser?.uid;
        const isOwner = post.authorId === uid;
        const isPrivileged = FirebaseAuth.isModerator();
        if (!isOwner && !isPrivileged) {
            Toast.show('Tidak memiliki izin menghapus posting ini', 'error');
            throw new Error('Unauthorized');
        }
        const { error } = await supabase.from('posts').delete().eq('id', postId);
        if (error) { console.error('Delete post error:', error); throw error; }
        await AuditLog.log('delete_post', { postId });
    },

    async getPost(postId) {
        const { data, error } = await supabase.from('posts').select('*').eq('id', postId).maybeSingle();
        if (error) {
            if (error.code !== 'PGRST116') console.error('Get post error:', error);
            return null;
        }
        return data ? this.normalizePost(data) : null;
    },

    async getPosts(options = {}) {
        let query = supabase.from('posts').select('*');
        if (options.status) query = query.eq('status', options.status);
        if (options.authorId) query = query.eq('author_id', options.authorId);
        query = query.order('created_at', { ascending: false });
        query = query.limit(options.limit || 50);
        const { data, error } = await query;
        if (error) { console.error('Get posts error:', error); return []; }
        return data.map(p => this.normalizePost(p));
    },

    async getAllApprovedPosts(limit = 100) {
        const { data, error } = await supabase
            .from('posts')
            .select('*')
            .eq('status', 'approved')
            .order('created_at', { ascending: false })
            .limit(limit);
        if (error) { console.error('Get approved posts error:', error); return []; }
        return data.map(p => this.normalizePost(p));
    },

    // ===== USERS =====
    async getUserRole(uid) {
        const { data, error } = await supabase.from('users').select('role').eq('id', uid).maybeSingle();
        if (error) return ROLES.GUEST;
        return data?.role || ROLES.GUEST;
    },

    async updateUserRole(uid, role) {
        const { error } = await supabase.from('users').update({ role, updated_at: new Date().toISOString() }).eq('id', uid);
        if (error) throw error;
        await AuditLog.log('update_role', { uid, role });
    },

    async getUsers(limit = 20) {
        const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false }).limit(limit);
        if (error) return [];
        return (data || []).map(u => ({
            ...u,
            displayName: u.display_name || u.name || u.email,
            createdAt: u.created_at
        }));
    },

    // ===== FAVORITES =====
    async toggleFavorite(postId) {
        const uid = FirebaseAuth.currentUser?.uid;
        if (!uid) { Toast.show('Login terlebih dahulu', 'warning'); return false; }

        const { data: existing } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', uid)
            .eq('post_id', postId)
            .maybeSingle();

        if (existing) {
            await supabase.from('favorites').delete().eq('id', existing.id);
            const post = await this.getPost(postId);
            if (post) await this.updatePost(postId, { favorites: Math.max(0, (post.favorites || 1) - 1) });
            return false;
        } else {
            await supabase.from('favorites').insert({
                user_id: uid, post_id: postId, created_at: new Date().toISOString()
            });
            const post = await this.getPost(postId);
            if (post) await this.updatePost(postId, { favorites: (post.favorites || 0) + 1 });
            return true;
        }
    },

    async isFavorited(postId) {
        const uid = FirebaseAuth.currentUser?.uid;
        if (!uid) return false;
        const { data } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', uid)
            .eq('post_id', postId)
            .maybeSingle();
        return !!data;
    },

    async getFavorites(userId) {
        const { data: favs, error } = await supabase
            .from('favorites')
            .select('post_id')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error || !favs?.length) return [];
        const posts = await Promise.all(favs.map(f => this.getPost(f.post_id)));
        return posts.filter(Boolean);
    },

    // ===== NOTIFICATIONS =====
    async createNotification(userId, data) {
        const { error } = await supabase.from('notifications').insert({
            user_id: userId, title: data.title || data.message,
            message: data.message, description: data.description || null,
            type: data.type || 'info', read: false,
            created_at: new Date().toISOString()
        });
        if (error) console.error('Notification error:', error);
    },

    async getNotifications(userId) {
        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(50);
        if (error) return [];
        return (data || []).map(n => ({ ...n, createdAt: n.created_at }));
    },

    async markNotificationRead(notifId) {
        await supabase.from('notifications').update({ read: true }).eq('id', notifId);
    },

    async getUnreadCount(userId) {
        const { count, error } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('read', false);
        if (error) return 0;
        return count || 0;
    },

    // ===== REPORTS =====
    async createReport(postId, data) {
        const { error } = await supabase.from('reports').insert({
            post_id: postId, reason: data.reason, detail: data.detail,
            reporter_id: data.reporterId, reporter_name: data.reporterName,
            status: 'pending', created_at: new Date().toISOString()
        });
        if (error) throw error;
    },

    async getReports(status = 'pending') {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('status', status)
            .order('created_at', { ascending: false });
        if (error) return [];
        return (data || []).map(r => ({
            ...r,
            reporterName: r.reporter_name,
            createdAt: r.created_at
        }));
    },

    async resolveReport(reportId, action) {
        await supabase.from('reports').update({
            status: action, resolved_at: new Date().toISOString()
        }).eq('id', reportId);
    },

    // ===== AI LOGS =====
    async logAIMatch(data) {
        await supabase.from('ai_match_history').insert({
            ...data, created_at: new Date().toISOString()
        });
    },

    async logAISearch(data) {
        const { error } = await supabase.from('ai_search_logs').insert({
            user_id: data.userId || null, query: data.query,
            result_count: data.resultCount || 0,
            created_at: new Date().toISOString()
        });
        if (error) console.error('AI search log error:', error);
    },

    // ===== DASHBOARD STATS =====
    async getDashboardStats() {
        const today = new Date().toISOString().split('T')[0];

        const [postsRes, todayPostsRes, usersRes, todaySearchRes] = await Promise.all([
            supabase.from('posts').select('id, status', { count: 'exact' }),
            supabase.from('posts').select('id', { count: 'exact' }).gte('created_at', today),
            supabase.from('users').select('id', { count: 'exact' }),
            supabase.from('ai_search_logs').select('id', { count: 'exact' }).gte('created_at', today)
        ]);

        return {
            totalPosts: postsRes.count || 0,
            todayPosts: todayPostsRes.count || 0,
            totalUsers: usersRes.count || 0,
            todaySearches: todaySearchRes.count || 0,
            todayMatches: 0,
            foundCount: postsRes.data?.filter(p => p.status === 'found').length || 0
        };
    },

    async getMonthlyStats() {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
        const { data, error } = await supabase
            .from('posts')
            .select('created_at')
            .gte('created_at', startDate.toISOString());
        if (error || !data) return [];

        const monthCounts = {};
        for (let i = 0; i < 12; i++) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
            monthCounts[key] = 0;
        }
        data.forEach(row => {
            const d = new Date(row.created_at);
            const key = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
            if (monthCounts[key] !== undefined) monthCounts[key]++;
        });

        return Object.entries(monthCounts).map(([label, count]) => ({ label, count }));
    },

    // ===== HELPER: Normalize snake_case to camelCase =====
    normalizePost(row) {
        if (!row) return null;
        return {
            id: row.id,
            authorId: row.author_id,
            authorName: row.author_name,
            fullName: row.full_name,
            nickname: row.nickname,
            gender: row.gender,
            estimatedAge: row.estimated_age,
            birthDate: row.birth_date,
            relation: row.relation,
            photoURL: row.photo_url,
            photoURLs: row.photo_urls,
            city: row.city,
            province: row.province,
            country: row.country,
            lastAddress: row.last_address,
            school: row.school,
            university: row.university,
            workplace: row.workplace,
            phone: row.phone,
            emailTarget: row.email_target,
            physicalFeatures: row.physical_features,
            hobby: row.hobby,
            language: row.language,
            description: row.description,
            lastMeetingDate: row.last_meeting_date,
            lastMeetingLocation: row.last_meeting_location,
            reporterName: row.reporter_name,
            reporterRelation: row.reporter_relation,
            reporterPhone: row.reporter_phone,
            reporterEmail: row.reporter_email,
            reporterFacebook: row.reporter_facebook,
            reporterInstagram: row.reporter_instagram,
            reporterTelegram: row.reporter_telegram,
            reporterAddress: row.reporter_address,
            status: row.status,
            aiScore: row.ai_score,
            aiAnalysis: row.ai_analysis,
            views: row.views,
            favorites: row.favorites,
            createdAt: row.created_at,
            updatedAt: row.updated_at
        };
    }
};

const AuditLog = {
    async log(action, data) {
        try {
            await supabase.from('audit_logs').insert({
                action, data, user_id: FirebaseAuth.currentUser?.uid || null,
                created_at: new Date().toISOString()
            });
        } catch (e) { console.error('Audit log error:', e); }
    }
};
