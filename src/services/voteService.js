import { supabase, isSupabaseConfigured } from '../lib/supabase';

export const voteService = {
  /**
   * Check if a specific user has voted on an issue
   */
  async hasUserVoted(issueId, userId) {
    if (!isSupabaseConfigured() || !issueId || !userId) return false;

    const { data, error } = await supabase
      .from('issue_votes')
      .select('id')
      .eq('issue_id', issueId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error checking vote status:', error);
      return false;
    }
    return !!data;
  },

  /**
   * Get total vote count for an issue
   */
  async getVoteCount(issueId) {
    if (!isSupabaseConfigured() || !issueId) return 0;

    const { count, error } = await supabase
      .from('issue_votes')
      .select('id', { count: 'exact', head: true })
      .eq('issue_id', issueId);

    if (error) {
      console.error('Error fetching vote count:', error);
      return 0;
    }
    return count || 0;
  },

  /**
   * Toggle user vote: inserts if not exists, deletes if already voted
   */
  async toggleVote(issueId, userId) {
    if (!isSupabaseConfigured()) {
      throw new Error('Database connection is not configured.');
    }
    if (!issueId || !userId) {
      throw new Error('User authentication required to vote.');
    }

    const hasVoted = await this.hasUserVoted(issueId, userId);

    if (hasVoted) {
      const { error } = await supabase
        .from('issue_votes')
        .delete()
        .eq('issue_id', issueId)
        .eq('user_id', userId);

      if (error) throw error;
      const newCount = await this.getVoteCount(issueId);
      return { voted: false, count: newCount };
    } else {
      const { error } = await supabase
        .from('issue_votes')
        .insert({
          issue_id: issueId,
          user_id: userId
        });

      if (error) throw error;
      const newCount = await this.getVoteCount(issueId);
      return { voted: true, count: newCount };
    }
  }
};

export default voteService;
