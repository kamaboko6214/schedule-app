-- ============================================================
-- 1. users (プロフィール) テーブル
--    auth.users と 1:1 で紐づくプロフィールテーブル
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT        NOT NULL,
  display_name TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- updated_at を自動更新するトリガー関数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_users_updated
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 2. auth.users に新規ユーザーが作成されたとき
--    public.users に自動でレコードを挿入するトリガー
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. Row Level Security (RLS)
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 自分自身のレコードのみ参照・更新可能
CREATE POLICY "users_select_own" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- 4. schedules テーブル（未作成の場合）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.schedules (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  date        DATE        NOT NULL,
  start_time  TEXT,
  end_time    TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "schedules_select_own" ON public.schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "schedules_insert_own" ON public.schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "schedules_update_own" ON public.schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "schedules_delete_own" ON public.schedules
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 5. todos テーブル（未作成の場合）
-- ============================================================
CREATE TABLE IF NOT EXISTS public.todos (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  is_completed BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "todos_select_own" ON public.todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "todos_insert_own" ON public.todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "todos_update_own" ON public.todos
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "todos_delete_own" ON public.todos
  FOR DELETE USING (auth.uid() = user_id);
