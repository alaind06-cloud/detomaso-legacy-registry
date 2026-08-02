import { createClient } from "@supabase/supabase-js";

/**
 * Projet Supabase PARTAGÉ entre les différents registres de marques.
 * Ne jamais provisionner une nouvelle base : ces valeurs sont volontairement figées.
 * La clé anon est publiable (protégée par RLS).
 */
export const SUPABASE_URL = "https://darckkyqmzningzzbkhr.supabase.co";
export const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhcmNra3lxbXpuaW5nenpia2hyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMzc3ODAsImV4cCI6MjEwMDkxMzc4MH0.pnPTG7mmP3O_RSHCyegbLlM8JLvPocq3kfAqlriaV4E";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
});
