import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const notificationService = {
  /**
   * Fetch user notifications sorted by newest first
   */
  async getNotifications(userId) {
    if (!isSupabaseConfigured() || !userId) return [];

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    return data || [];
  },

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId) {
    if (!isSupabaseConfigured() || !notificationId) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) console.error('Error marking notification read:', error);
  },

  /**
   * Mark all notifications for a user as read
   */
  async markAllAsRead(userId) {
    if (!isSupabaseConfigured() || !userId) return;

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    if (error) console.error('Error marking all notifications read:', error);
  },

  /**
   * Dispatch a notification to a specific user
   */
  async createNotification(userId, issueId, title, message) {
    if (!isSupabaseConfigured() || !userId) return null;

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        issue_id: issueId,
        title,
        message,
        read: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error dispatching notification:', error);
      return null;
    }
    return data;
  }
};

export default notificationService;
