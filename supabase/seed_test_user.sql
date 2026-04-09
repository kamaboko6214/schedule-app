-- ============================================================
-- テストユーザー作成
-- Supabase Dashboard の SQL Editor で実行してください
--
-- テスト用ログイン情報:
--   Email   : test@example.com
--   Password: testpassword123
-- ============================================================

-- auth.users にテストユーザーを追加
-- ※ pgcrypto 拡張が有効である必要があります（Supabase はデフォルトで有効）
DO $$
BEGIN
  -- 既に存在する場合はスキップ
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@example.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      aud,
      role,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token
    )
    VALUES (
      gen_random_uuid(),
      '00000000-0000-0000-0000-000000000000',
      'test@example.com',
      crypt('testpassword123', gen_salt('bf')),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"display_name":"テストユーザー"}',
      'authenticated',
      'authenticated',
      NOW(),
      NOW(),
      '',
      ''
    );
  END IF;
END $$;

-- public.users にプロフィールを追加
-- （handle_new_user トリガーがある場合は自動で挿入されますが、
--   手動で入れる場合はこちらを実行してください）
DO $$
DECLARE
  v_id UUID;
BEGIN
  SELECT id INTO v_id FROM auth.users WHERE email = 'test@example.com';
  IF v_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.users WHERE id = v_id) THEN
    INSERT INTO public.users (id, email, display_name)
    VALUES (v_id, 'test@example.com', 'テストユーザー');
  END IF;
END $$;
