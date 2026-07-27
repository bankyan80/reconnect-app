-- Drop existing restrictive policies and recreate open ones
DROP POLICY IF EXISTS "allow_all_users" ON users;
DROP POLICY IF EXISTS "allow_all_posts" ON posts;
DROP POLICY IF EXISTS "allow_all_notifications" ON notifications;
DROP POLICY IF EXISTS "allow_all_reports" ON reports;
DROP POLICY IF EXISTS "allow_all_favorites" ON favorites;
DROP POLICY IF EXISTS "allow_all_audit" ON audit_logs;
DROP POLICY IF EXISTS "allow_all_ai_match" ON ai_match_history;
DROP POLICY IF EXISTS "allow_all_ai_search" ON ai_search_logs;
DROP POLICY IF EXISTS "allow_all_ai_cache" ON ai_recommendation_cache;
DROP POLICY IF EXISTS "allow_all_contacts" ON contacts;
DROP POLICY IF EXISTS "allow_all_photos" ON photos;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete" ON storage.objects;

-- Recreate open policies
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

-- Storage policies
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'posts');
CREATE POLICY "Anyone Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'posts');
CREATE POLICY "Anyone Delete" ON storage.objects FOR DELETE USING (bucket_id = 'posts');
