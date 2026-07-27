-- ============================================
-- CARI KELUARGA & SAHABAT AI - Supabase Schema
-- ============================================

-- 1. USERS
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    display_name TEXT,
    email TEXT,
    photo_url TEXT,
    role TEXT DEFAULT 'member' CHECK (role IN ('guest','member','moderator','admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. POSTS
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    author_id TEXT,
    author_name TEXT,
    full_name TEXT NOT NULL,
    nickname TEXT,
    gender TEXT,
    estimated_age INTEGER,
    birth_date TEXT,
    relation TEXT,
    photo_url TEXT,
    photo_urls JSONB DEFAULT '[]',
    city TEXT,
    province TEXT,
    country TEXT DEFAULT 'Indonesia',
    last_address TEXT,
    school TEXT,
    university TEXT,
    workplace TEXT,
    phone TEXT,
    email_target TEXT,
    physical_features TEXT,
    hobby TEXT,
    language TEXT,
    description TEXT,
    last_meeting_date TEXT,
    last_meeting_location TEXT,
    reporter_name TEXT,
    reporter_relation TEXT,
    reporter_phone TEXT,
    reporter_email TEXT,
    reporter_facebook TEXT,
    reporter_instagram TEXT,
    reporter_telegram TEXT,
    reporter_address TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','found','closed')),
    ai_score INTEGER DEFAULT 0,
    ai_analysis JSONB,
    views INTEGER DEFAULT 0,
    favorites INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PHOTOS
CREATE TABLE IF NOT EXISTS photos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt_text TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    message TEXT,
    description TEXT,
    type TEXT DEFAULT 'info',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. REPORTS
CREATE TABLE IF NOT EXISTS reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    reason TEXT,
    detail TEXT,
    reporter_id TEXT,
    reporter_name TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','resolved','dismissed')),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, post_id)
);

-- 7. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    action TEXT NOT NULL,
    data JSONB,
    user_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. AI MATCH HISTORY
CREATE TABLE IF NOT EXISTS ai_match_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
    query TEXT,
    post_id UUID,
    score INTEGER,
    result_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AI SEARCH LOGS
CREATE TABLE IF NOT EXISTS ai_search_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT,
    query TEXT,
    result_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AI RECOMMENDATION CACHE
CREATE TABLE IF NOT EXISTS ai_recommendation_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    recommendations JSONB,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CONTACTS
CREATE TABLE IF NOT EXISTS contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_author ON posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_city ON posts(city);
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_posts_full_name ON posts USING gin(to_tsvector('simple', full_name));
CREATE INDEX IF NOT EXISTS idx_posts_description ON posts USING gin(to_tsvector('simple', COALESCE(description, '')));
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_post ON favorites(post_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_ai_search_user ON ai_search_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ===== ROW LEVEL SECURITY (open since we use Firebase Auth) =====
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_match_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_search_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendation_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

-- Allow all operations via anon key (app-level security via Firebase Auth)
CREATE POLICY "allow_all_users" ON users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_posts" ON posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_reports" ON reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_favorites" ON favorites FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_audit" ON audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_ai_match" ON ai_match_history FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_ai_search" ON ai_search_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_ai_cache" ON ai_recommendation_cache FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_contacts" ON contacts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_photos" ON photos FOR ALL USING (true) WITH CHECK (true);
