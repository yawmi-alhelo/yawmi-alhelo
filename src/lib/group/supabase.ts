import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://evvlndiftoywyhcaigjn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_5dzvoIa77IBQRm_B5Vlhhw_w86a0ZAl';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
