// Supabase client (singleton).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://uexnfoqglhgjovvchqcu.supabase.co";
const SUPABASE_KEY = "sb_publishable_CBOv7TBki6pnA_TxkAGOmg_aYaIVu_w";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    flowType: "pkce"
  }
});
