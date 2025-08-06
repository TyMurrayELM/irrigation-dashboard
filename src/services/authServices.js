import { supabase } from '../utils/supabase';

// Define admin emails - add your email here!
const ADMIN_EMAILS = [
  'tyler.murray@encorelm.com', // Replace with your actual email
  // Add other admin emails as needed
];

export const authService = {
  // Sign in with Google
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin, // Redirects back to your app
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { success: false, error };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      return { success: false, error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.full_name || user.email,
          picture: user.user_metadata?.avatar_url,
          isAdmin: ADMIN_EMAILS.includes(user.email)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Check if user is admin
  isAdmin(email) {
    return ADMIN_EMAILS.includes(email);
  },

  // Listen for auth changes
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email,
          picture: session.user.user_metadata?.avatar_url,
          isAdmin: ADMIN_EMAILS.includes(session.user.email)
        };
        callback(user);
      } else {
        callback(null);
      }
    });
  }
};