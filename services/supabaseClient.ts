import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

let supabaseInstance;

try {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn('Supabase environment variables missing. Database features will be disabled.');
        // Create a dummy client that warns when used
        supabaseInstance = {
            from: () => ({
                select: () => ({ eq: () => ({ single: () => ({ data: null, error: 'Supabase not configured' }), order: () => ({ data: [], error: 'Supabase not configured' }) }), order: () => ({ data: [], error: 'Supabase not configured' }) }),
                insert: () => ({ select: () => ({ single: () => ({ data: null, error: 'Supabase not configured' }) }) })
            }),
            auth: {
                signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase not configured' } }),
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            }
        } as any;
    } else {
        supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    }
} catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabaseInstance = {
        from: () => ({
            select: () => ({ eq: () => ({ single: () => ({ data: null, error: 'Supabase init failed' }), order: () => ({ data: [], error: 'Supabase init failed' }) }), order: () => ({ data: [], error: 'Supabase init failed' }) }),
            insert: () => ({ select: () => ({ single: () => ({ data: null, error: 'Supabase init failed' }) }) })
        }),
        auth: {
            signInWithPassword: () => Promise.resolve({ data: { user: null }, error: { message: 'Supabase init failed' } }),
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
        }
    } as any;
}

export const supabase = supabaseInstance;
