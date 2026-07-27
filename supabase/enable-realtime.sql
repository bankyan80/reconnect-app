-- Enable Supabase Realtime for posts table
-- Run this in: Supabase Dashboard > SQL Editor > New Query

ALTER PUBLICATION supabase_realtime ADD TABLE posts;
