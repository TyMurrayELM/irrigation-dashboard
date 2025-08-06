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
      // Use the production URL when deployed, localhost when developing
      const redirectUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3000'
        : 'https://irrigation-dashboard-six.vercel.app';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
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

  // Log user activity
  async logUserActivity(action = 'login') {
    try {
      const user = await authService.getCurrentUser();
      if (!user) return;

      if (action === 'login') {
        // Log login activity
        const { error } = await supabase.rpc('log_user_activity', {
          p_user_id: user.id,
          p_email: user.email,
          p_name: user.name,
          p_ip_address: window.location.hostname,
          p_user_agent: navigator.userAgent
        });
        
        if (error) console.error('Error logging user activity:', error);
      } else if (action === 'logout') {
        // Update logout time
        const { error } = await supabase.rpc('update_user_logout', {
          p_user_id: user.id
        });
        
        if (error) console.error('Error updating logout time:', error);
      }
    } catch (error) {
      console.error('Error in logUserActivity:', error);
    }
  },

  // Get user activity data (for admin dashboard)
  async getUserActivity(timeframe = 'week') {
    try {
      // Return empty array if table doesn't exist yet
      let query = supabase
        .from('user_activity_stats')
        .select('*')
        .order('last_login', { ascending: false });

      // Add timeframe filter if needed
      if (timeframe === 'day') {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('last_login', oneDayAgo);
      } else if (timeframe === 'week') {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('last_login', oneWeekAgo);
      } else if (timeframe === 'month') {
        const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
        query = query.gte('last_login', oneMonthAgo);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching user activity:', error);
        return [];
      }
      return data || [];
    } catch (error) {
      console.error('Error fetching user activity:', error);
      return [];
    }
  },

  // Get detailed activity for a specific user
  async getUserActivityDetails(email) {
    try {
      const { data, error } = await supabase
        .from('user_activity')
        .select('*')
        .eq('email', email)
        .order('login_time', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user activity details:', error);
      return [];
    }
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
        
        // Log activity on sign in (removed the await that was causing issues)
        if (event === 'SIGNED_IN') {
          authService.logUserActivity('login');
        }
        
        callback(user);
      } else {
        callback(null);
      }
    });
  }
};