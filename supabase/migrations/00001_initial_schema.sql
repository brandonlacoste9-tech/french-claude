-- ============================================================================
-- 🔥⚜️ ZYEUTÉ - Database Schema ⚜️🔥
-- "Le TikTok du Québec" - Premier réseau social 100% québécois
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For search

-- ============================================================================
-- 📍 ENUM TYPES
-- ============================================================================

-- Quebec Regions
CREATE TYPE quebec_region AS ENUM (
  'montreal',
  'quebec_city',
  'laval',
  'gatineau',
  'longueuil',
  'sherbrooke',
  'saguenay',
  'trois_rivieres',
  'terrebonne',
  'saint_jean',
  'drummondville',
  'granby',
  'saint_hyacinthe',
  'rimouski',
  'victoriaville',
  'rouyn_noranda',
  'sept_iles',
  'val_dor',
  'alma',
  'baie_comeau',
  'gaspesie',
  'charlevoix',
  'laurentides',
  'lanaudiere',
  'monteregie',
  'estrie',
  'mauricie',
  'outaouais',
  'abitibi',
  'cote_nord',
  'bas_saint_laurent',
  'centre_du_quebec',
  'other'
);

-- Montreal Quartiers (for hyper-local)
CREATE TYPE montreal_quartier AS ENUM (
  'plateau',
  'mile_end',
  'hochelaga',
  'rosemont',
  'villeray',
  'ahuntsic',
  'verdun',
  'griffintown',
  'old_montreal',
  'downtown',
  'ndg',
  'westmount',
  'outremont',
  'saint_leonard',
  'anjou',
  'lasalle',
  'lachine',
  'pointe_claire',
  'dorval',
  'saint_laurent',
  'cote_des_neiges',
  'parc_extension',
  'little_italy',
  'saint_henri',
  'sud_ouest',
  'mercier',
  'montreal_nord',
  'riviere_des_prairies',
  'other'
);

-- Dialect preferences
CREATE TYPE dialect_preference AS ENUM (
  'joual_montreal',      -- Classic Montreal joual
  'joual_quebec',        -- Quebec City accent
  'joual_saguenay',      -- Saguenay accent
  'joual_beauce',        -- Beauce accent
  'french_standard',     -- Standard Quebec French
  'bilingual'            -- French/English mix
);

-- User roles
CREATE TYPE user_role AS ENUM (
  'viewer',
  'creator',
  'verified',
  'business',
  'moderator',
  'admin'
);

-- Content types
CREATE TYPE content_type AS ENUM (
  'image',
  'video',
  'text',
  'carousel',
  'story',
  'live'
);

-- Post visibility
CREATE TYPE post_visibility AS ENUM (
  'public',
  'followers',
  'private',
  'regional'  -- Only visible in creator's region
);

-- Notification types
CREATE TYPE notification_type AS ENUM (
  'like',
  'comment',
  'follow',
  'mention',
  'reply',
  'gift',
  'milestone',
  'system'
);

-- Transaction types
CREATE TYPE transaction_type AS ENUM (
  'purchase',    -- User buys cennes
  'gift',        -- User sends gift
  'receive',     -- Creator receives gift
  'payout',      -- Creator withdraws
  'refund',
  'bonus'
);

-- ============================================================================
-- 👤 USERS & PROFILES
-- ============================================================================

-- Core users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identity
  username TEXT UNIQUE NOT NULL CHECK (username ~* '^[a-z0-9_]{3,30}$'),
  display_name TEXT NOT NULL CHECK (length(display_name) <= 50),
  bio TEXT CHECK (length(bio) <= 500),
  avatar_url TEXT,
  banner_url TEXT,
  
  -- Quebec-specific
  region quebec_region NOT NULL DEFAULT 'montreal',
  quartier montreal_quartier,
  dialect dialect_preference DEFAULT 'joual_montreal',
  
  -- Status
  role user_role DEFAULT 'viewer',
  is_verified BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT FALSE,
  is_banned BOOLEAN DEFAULT FALSE,
  ban_reason TEXT,
  
  -- Stats (denormalized for performance)
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  likes_received INTEGER DEFAULT 0,
  
  -- Creator economy
  cennes_balance INTEGER DEFAULT 0,  -- Virtual currency
  total_earned INTEGER DEFAULT 0,
  
  -- Metadata
  website TEXT,
  instagram_handle TEXT,
  tiktok_handle TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Search optimization
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(username, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(display_name, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(bio, '')), 'B')
  ) STORED
);

-- Indexes
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_region ON profiles(region);
CREATE INDEX idx_profiles_quartier ON profiles(quartier) WHERE quartier IS NOT NULL;
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_search ON profiles USING GIN(search_vector);
CREATE INDEX idx_profiles_followers ON profiles(followers_count DESC);

-- ============================================================================
-- 📝 POSTS & CONTENT
-- ============================================================================

CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Content
  content_type content_type NOT NULL DEFAULT 'image',
  caption TEXT CHECK (length(caption) <= 2200),
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  thumbnail_url TEXT,
  
  -- AI-generated
  ai_caption TEXT,              -- Ti-Guy generated
  ai_hashtags TEXT[],           -- Ti-Guy suggested
  ai_generated_image BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  visibility post_visibility DEFAULT 'public',
  location_name TEXT,           -- "Mont-Royal, Montréal"
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Quebec context
  region quebec_region,
  quartier montreal_quartier,
  
  -- Stats (denormalized)
  feu_count INTEGER DEFAULT 0,       -- "Likes" = Feu 🔥
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  saves_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Engagement score (for algorithm)
  engagement_score DECIMAL(10, 4) DEFAULT 0,
  trending_score DECIMAL(10, 4) DEFAULT 0,
  
  -- Moderation
  is_hidden BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  flag_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Search
  search_vector TSVECTOR GENERATED ALWAYS AS (
    setweight(to_tsvector('french', coalesce(caption, '')), 'A') ||
    setweight(to_tsvector('french', coalesce(array_to_string(ai_hashtags, ' '), '')), 'B')
  ) STORED
);

-- Indexes
CREATE INDEX idx_posts_user ON posts(user_id);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_region ON posts(region);
CREATE INDEX idx_posts_quartier ON posts(quartier) WHERE quartier IS NOT NULL;
CREATE INDEX idx_posts_trending ON posts(trending_score DESC) WHERE is_hidden = FALSE;
CREATE INDEX idx_posts_engagement ON posts(engagement_score DESC) WHERE is_hidden = FALSE;
CREATE INDEX idx_posts_search ON posts USING GIN(search_vector);
CREATE INDEX idx_posts_visibility ON posts(visibility) WHERE is_hidden = FALSE;

-- ============================================================================
-- 🔥 INTERACTIONS (Feu, Comments, Shares)
-- ============================================================================

-- "Feu" = Likes with intensity (1-5 flames)
CREATE TABLE public.feux (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  intensity INTEGER DEFAULT 1 CHECK (intensity BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_feux_post ON feux(post_id);
CREATE INDEX idx_feux_user ON feux(user_id);

-- Comments
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For replies
  
  content TEXT NOT NULL CHECK (length(content) <= 1000),
  
  -- Stats
  likes_count INTEGER DEFAULT 0,
  replies_count INTEGER DEFAULT 0,
  
  -- Moderation
  is_hidden BOOLEAN DEFAULT FALSE,
  is_flagged BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;

-- Saves (bookmarks)
CREATE TABLE public.saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  collection_name TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, post_id)
);

CREATE INDEX idx_saves_user ON saves(user_id);
CREATE INDEX idx_saves_post ON saves(post_id);

-- Shares
CREATE TABLE public.shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  share_type TEXT DEFAULT 'internal', -- internal, external, dm
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_shares_post ON shares(post_id);

-- ============================================================================
-- 👥 SOCIAL GRAPH
-- ============================================================================

CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);

-- Blocks
CREATE TABLE public.blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  blocker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(blocker_id, blocked_id)
);

CREATE INDEX idx_blocks_blocker ON blocks(blocker_id);
CREATE INDEX idx_blocks_blocked ON blocks(blocked_id);

-- ============================================================================
-- 🔔 NOTIFICATIONS
-- ============================================================================

CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  
  -- Related entities
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  data JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- ============================================================================
-- 💰 CREATOR ECONOMY (Cennes)
-- ============================================================================

-- Cenne packages for purchase
CREATE TABLE public.cenne_packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  cennes_amount INTEGER NOT NULL,
  price_cad DECIMAL(10, 2) NOT NULL,
  bonus_percent INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  stripe_price_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Virtual gifts
CREATE TABLE public.virtual_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_fr TEXT NOT NULL,           -- Quebec French name
  emoji TEXT NOT NULL,
  description TEXT,
  cennes_cost INTEGER NOT NULL,
  animation_url TEXT,              -- Lottie or video
  is_active BOOLEAN DEFAULT TRUE,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default Quebec-themed gifts
INSERT INTO virtual_gifts (name, name_fr, emoji, cennes_cost, is_active) VALUES
  ('Poutine', 'Poutine', '🍟', 50, TRUE),
  ('Beaver', 'Castor', '🦫', 100, TRUE),
  ('Maple Leaf', 'Feuille d''érable', '🍁', 25, TRUE),
  ('Fleur-de-lys', 'Fleur-de-lys', '⚜️', 200, TRUE),
  ('Hockey Puck', 'Rondelle', '🏒', 75, TRUE),
  ('Tuque', 'Tuque', '🧢', 50, TRUE),
  ('Caribou', 'Caribou', '🦌', 150, TRUE),
  ('Construction Cone', 'Cône orange', '🚧', 30, TRUE),
  ('Tire d''érable', 'Tire d''érable', '🍯', 100, TRUE),
  ('Crown', 'Couronne', '👑', 500, TRUE);

-- Transactions ledger
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,          -- Positive or negative
  balance_after INTEGER NOT NULL,
  
  -- Related entities
  recipient_id UUID REFERENCES profiles(id),
  post_id UUID REFERENCES posts(id),
  gift_id UUID REFERENCES virtual_gifts(id),
  package_id UUID REFERENCES cenne_packages(id),
  
  -- Payment info
  stripe_payment_id TEXT,
  stripe_payout_id TEXT,
  
  -- Metadata
  description TEXT,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_user ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);

-- Gifts sent
CREATE TABLE public.sent_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  gift_id UUID NOT NULL REFERENCES virtual_gifts(id),
  
  quantity INTEGER DEFAULT 1,
  total_cennes INTEGER NOT NULL,
  
  message TEXT CHECK (length(message) <= 200),
  
  transaction_id UUID REFERENCES transactions(id),
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_sent_gifts_sender ON sent_gifts(sender_id);
CREATE INDEX idx_sent_gifts_recipient ON sent_gifts(recipient_id);
CREATE INDEX idx_sent_gifts_post ON sent_gifts(post_id);

-- ============================================================================
-- 📬 MESSAGES
-- ============================================================================

CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_group BOOLEAN DEFAULT FALSE,
  name TEXT,  -- For group chats
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.conversation_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  last_read_at TIMESTAMPTZ DEFAULT NOW(),
  is_muted BOOLEAN DEFAULT FALSE,
  
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(conversation_id, user_id)
);

CREATE INDEX idx_conv_members_user ON conversation_members(user_id);
CREATE INDEX idx_conv_members_conv ON conversation_members(conversation_id);

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  content TEXT CHECK (length(content) <= 2000),
  media_url TEXT,
  
  -- For sharing posts in DMs
  shared_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  
  is_deleted BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conv ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);

-- ============================================================================
-- 🏷️ HASHTAGS & TRENDS
-- ============================================================================

CREATE TABLE public.hashtags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tag TEXT UNIQUE NOT NULL CHECK (tag ~* '^[a-zà-ÿ0-9_]{1,50}$'),
  
  -- Stats
  posts_count INTEGER DEFAULT 0,
  weekly_posts INTEGER DEFAULT 0,
  
  -- Trending
  is_trending BOOLEAN DEFAULT FALSE,
  trending_score DECIMAL(10, 4) DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_hashtags_tag ON hashtags(tag);
CREATE INDEX idx_hashtags_trending ON hashtags(trending_score DESC) WHERE is_trending = TRUE;

CREATE TABLE public.post_hashtags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  hashtag_id UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
  
  PRIMARY KEY (post_id, hashtag_id)
);

CREATE INDEX idx_post_hashtags_hashtag ON post_hashtags(hashtag_id);

-- ============================================================================
-- 🎯 CHALLENGES (Quebec-themed)
-- ============================================================================

CREATE TABLE public.challenges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  title TEXT NOT NULL,
  title_fr TEXT NOT NULL,
  description TEXT,
  description_fr TEXT,
  
  hashtag TEXT NOT NULL,
  
  -- Rewards
  prize_cennes INTEGER DEFAULT 0,
  prize_description TEXT,
  
  -- Timing
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  
  -- Stats
  participants_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0,
  
  -- Media
  banner_url TEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_challenges_active ON challenges(is_active, starts_at, ends_at);
CREATE INDEX idx_challenges_featured ON challenges(is_featured) WHERE is_featured = TRUE;

-- ============================================================================
-- 🛡️ MODERATION
-- ============================================================================

CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- What's being reported
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  reported_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reported_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  
  reason TEXT NOT NULL,
  details TEXT,
  
  -- Resolution
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolved_by UUID REFERENCES profiles(id),
  resolution_notes TEXT,
  action_taken TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created ON reports(created_at DESC);

-- ============================================================================
-- 📊 ANALYTICS (for creators)
-- ============================================================================

CREATE TABLE public.post_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  
  date DATE NOT NULL,
  
  views INTEGER DEFAULT 0,
  unique_viewers INTEGER DEFAULT 0,
  feux INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  profile_visits INTEGER DEFAULT 0,
  
  -- Demographics
  viewers_by_region JSONB DEFAULT '{}',
  viewers_by_age JSONB DEFAULT '{}',
  
  UNIQUE(post_id, date)
);

CREATE INDEX idx_post_analytics_post ON post_analytics(post_id);
CREATE INDEX idx_post_analytics_date ON post_analytics(date DESC);

-- ============================================================================
-- 🔧 FUNCTIONS & TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
  
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update follower counts
CREATE OR REPLACE FUNCTION update_follow_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE profiles SET followers_count = followers_count + 1 WHERE id = NEW.following_id;
    UPDATE profiles SET following_count = following_count + 1 WHERE id = NEW.follower_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE profiles SET followers_count = followers_count - 1 WHERE id = OLD.following_id;
    UPDATE profiles SET following_count = following_count - 1 WHERE id = OLD.follower_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_follow_counts AFTER INSERT OR DELETE ON follows
  FOR EACH ROW EXECUTE FUNCTION update_follow_counts();

-- Update post feu count
CREATE OR REPLACE FUNCTION update_feu_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET feu_count = feu_count + NEW.intensity WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET feu_count = feu_count - OLD.intensity WHERE id = OLD.post_id;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE posts SET feu_count = feu_count - OLD.intensity + NEW.intensity WHERE id = NEW.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_feu_count AFTER INSERT OR DELETE OR UPDATE ON feux
  FOR EACH ROW EXECUTE FUNCTION update_feu_count();

-- Update comment count
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    IF NEW.parent_id IS NOT NULL THEN
      UPDATE comments SET replies_count = replies_count + 1 WHERE id = NEW.parent_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    IF OLD.parent_id IS NOT NULL THEN
      UPDATE comments SET replies_count = replies_count - 1 WHERE id = OLD.parent_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_comment_count AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- ============================================================================
-- 🔒 ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE feux ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, own write
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (NOT is_banned);
  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Posts: Based on visibility
CREATE POLICY "Public posts are viewable" ON posts
  FOR SELECT USING (
    visibility = 'public' AND NOT is_hidden
    OR user_id = auth.uid()
  );
  
CREATE POLICY "Users can create own posts" ON posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own posts" ON posts
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own posts" ON posts
  FOR DELETE USING (auth.uid() = user_id);

-- Comments: Viewable if post is viewable
CREATE POLICY "Comments viewable if post viewable" ON comments
  FOR SELECT USING (NOT is_hidden);
  
CREATE POLICY "Users can create comments" ON comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);
  
CREATE POLICY "Users can update own comments" ON comments
  FOR UPDATE USING (auth.uid() = user_id);
  
CREATE POLICY "Users can delete own comments" ON comments
  FOR DELETE USING (auth.uid() = user_id);

-- Feux: Public read, authenticated write
CREATE POLICY "Feux are viewable" ON feux
  FOR SELECT USING (TRUE);
  
CREATE POLICY "Users can manage own feux" ON feux
  FOR ALL USING (auth.uid() = user_id);

-- Follows: Public read, authenticated write
CREATE POLICY "Follows are viewable" ON follows
  FOR SELECT USING (TRUE);
  
CREATE POLICY "Users can manage own follows" ON follows
  FOR ALL USING (auth.uid() = follower_id);

-- Notifications: Own only
CREATE POLICY "Users see own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);
  
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- Messages: Participants only
CREATE POLICY "Users see own messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversation_members
      WHERE conversation_id = messages.conversation_id
      AND user_id = auth.uid()
    )
  );

-- Transactions: Own only
CREATE POLICY "Users see own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 📊 INITIAL DATA
-- ============================================================================

-- Cenne packages
INSERT INTO cenne_packages (name, cennes_amount, price_cad, bonus_percent, stripe_price_id) VALUES
  ('Starter', 100, 1.99, 0, NULL),
  ('Popular', 500, 7.99, 10, NULL),
  ('Best Value', 1200, 14.99, 20, NULL),
  ('Creator Pack', 3000, 34.99, 30, NULL),
  ('Whale', 10000, 99.99, 50, NULL);

-- ============================================================================
-- ⚜️ Fait au Québec, pour le Québec ⚜️
-- ============================================================================
