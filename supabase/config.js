// Supabase Configuration
const SUPABASE_URL = 'https://yfwikwedzqdicpjyqfhv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmd2lrd2VkenFkaWNwanlxZmh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxNDY5ODAsImV4cCI6MjEwMDcyMjk4MH0.zdshKM5r-jHRKW_9IMmGiGI5MrU5XMJtfopQh9Zv_bw';

if (typeof window.supabase === 'undefined') {
    console.error('Supabase CDN script not loaded');
}
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
