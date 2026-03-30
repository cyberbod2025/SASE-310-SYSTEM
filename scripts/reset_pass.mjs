import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://uvnetpnjinxzhggoqmwz.supabase.co";
// I will just use the anon key if possible. Wait, anon key cannot update passwords unless the user is logged in. 
// Or better, I can just use signUp, but the user already exists.
