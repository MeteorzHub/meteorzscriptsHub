// supabaseClient.js
// Put your supabase url and anon key here.
export const SUPABASE_URL = "https://xosgnvwhjhovzjwcfqlr.supabase.co";
export const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhvc2dudndoamhvdnpqd2NmcWxyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzYwMzIsImV4cCI6MjA3NjIxMjAzMn0.ipi5YUc5OZmnZP1TBsYbzTTEXekXxX_3sgd0OVcb9zk";

import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
