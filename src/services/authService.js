import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const authService = {
  /**
   * Register a new campus user (student or admin)
   */
  async signUp(email, password, name, role = 'student') {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please add your credentials in .env');
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name.trim(),
          role: role
        }
      }
    });

    if (error) throw error;

    // In case the auth trigger is delayed or need explicit profile record
    if (data.user) {
      try {
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name: name.trim(),
            email: email.toLowerCase().trim(),
            role: role
          });
      } catch (err) {
        console.warn('Profile sync fallback caught:', err);
      }
    }

    return data;
  },

  /**
   * Authenticate an existing user
   */
  async signIn(email, password) {
    if (!isSupabaseConfigured()) {
      throw new Error('Supabase is not configured. Please add your credentials in .env');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase().trim(),
      password
    });

    if (error) throw error;
    return data;
  },

  /**
   * Sign out current session
   */
  async signOut() {
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  /**
   * Get currently active session user
   */
  async getCurrentUser() {
    if (!isSupabaseConfigured()) return null;
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return null;
    return user;
  },

  /**
   * Fetch profile associated with an auth user id
   */
  async getProfile(userId) {
    if (!isSupabaseConfigured() || !userId) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    return data;
  },

  /**
   * Listen to authentication state changes
   */
  onAuthStateChange(callback) {
    if (!isSupabaseConfigured()) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    }
    return supabase.auth.onAuthStateChange(callback);
  }
};

export default authService;
