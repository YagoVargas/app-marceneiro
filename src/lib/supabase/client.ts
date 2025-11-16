import { createBrowserClient } from '@supabase/ssr';

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// 👇 login automático TEMPORÁRIO enquanto o app não tem auth
supabase.auth.signInWithPassword({
  email: "teste@teste.com",
  password: "12345678"
});
