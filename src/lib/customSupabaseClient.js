/**
 * DEPRECATED: Use @/lib/supabase.js instead
 * 
 * This file is kept for backwards compatibility only.
 * All imports should be migrated to use the centralized supabase client.
 * 
 * Migration path:
 * - OLD: import customSupabaseClient from '@/lib/customSupabaseClient';
 * - NEW: import { supabase } from '@/lib/supabase';
 */

import { supabase } from './supabase';

console.warn('⚠️ DEPRECATED: customSupabaseClient.js is deprecated. Use @/lib/supabase.js instead.');

export default supabase;
export { supabase, supabase as customSupabaseClient };
