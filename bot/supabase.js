// bot/supabase.js — service_role key ishlatish kerak!
// anon key RLS ga bo'ysunadi, service_role esa RLS ni bypass qiladi

import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config()

export const supabase = createClient(
    process.env.SUPABASE_URL,
    // ❗ SERVICE_ROLE KEY ishlatish kerak (anon emas!)
    // Supabase Dashboard → Settings → API → service_role key
    process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_KEY
)