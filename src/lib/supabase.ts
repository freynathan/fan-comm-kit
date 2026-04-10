import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://irepzzaizekqzateddwf.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlyZXB6emFpemVrcXphdGVkZHdmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4MzgxMDEsImV4cCI6MjA5MTQxNDEwMX0.8QDuE5pnyi9X6zw0TVdhap35qDOrdgCVpaMfu7AZRpE";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
