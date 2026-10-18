import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if credentials are valid and not placeholder values
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-ref') &&
  supabaseAnonKey !== 'your-anon-key-here'
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Returns a persistent anonymous token for this browser to prevent simple duplicate voting.
 * Does not collect any personally identifiable device info.
 */
export function getOrCreateAnonymousVoterToken() {
  const STORAGE_KEY = 'of_voter_token';
  try {
    let token = localStorage.getItem(STORAGE_KEY);
    if (!token || typeof token !== 'string' || token.length < 10) {
      token = (typeof crypto !== 'undefined' && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'voter_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEY, token);
    }
    return token;
  } catch {
    return 'fallback_voter_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }
}

/**
 * Submits an email to the waitlist table.
 * @param {string} email - Visitor email address
 * @param {string|null} productId - Specific product ID or null for general newsletter
 * @returns {Promise<{ success: boolean, duplicate?: boolean, message: string }>}
 */
export async function submitWaitlistEmail(email, productId = null) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      isConfigured: false,
      message: 'Waitlist service is pending backend connection.'
    };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return {
      success: false,
      message: 'Please provide a valid email address.'
    };
  }

  try {
    const { error } = await supabase
      .from('waitlist')
      .insert({
        email: cleanEmail,
        product_id: productId || null
      });

    if (error) {
      // Postgres error code 23505 = unique constraint violation (duplicate signup)
      if (error.code === '23505') {
        return {
          success: true,
          duplicate: true,
          message: productId
            ? `You are already registered on the early notification list for ${productId}.`
            : "You are already registered on the early signal waitlist."
        };
      }
      return {
        success: false,
        message: 'Could not connect to waitlist database. Please try again shortly.'
      };
    }

    return {
      success: true,
      message: productId
        ? `Signal locked! You are registered for sample notifications for ${productId}.`
        : 'Signal locked! You are registered for Drop #01 early access.'
    };
  } catch {
    return {
      success: false,
      message: 'Network error communicating with server. Please check your connection.'
    };
  }
}

/**
 * Records a vote for a product or concept.
 * @param {string} itemId - e.g. 'OF-BRAT' or 'OF-X01'
 * @param {'product'|'concept'} itemType
 * @param {string} voterToken - Anonymous voter UUID
 * @returns {Promise<{ success: boolean, duplicate?: boolean, message: string }>}
 */
export async function recordVoteOnServer(itemId, itemType, voterToken) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      isConfigured: false,
      message: 'Voting server is currently disconnected.'
    };
  }

  try {
    const { error } = await supabase
      .from('item_votes')
      .insert({
        item_id: itemId,
        item_type: itemType,
        voter_token: voterToken
      });

    if (error) {
      if (error.code === '23505') {
        return {
          success: false,
          duplicate: true,
          message: `You have already cast a vote for ${itemId}.`
        };
      }
      return {
        success: false,
        message: 'Unable to record vote on database right now.'
      };
    }

    return {
      success: true,
      message: `Vote recorded on server for ${itemId}!`
    };
  } catch {
    return {
      success: false,
      message: 'Network error while casting vote.'
    };
  }
}

/**
 * Fetches real aggregate vote counts from Supabase.
 * Returns an object mapping itemId -> voteCount.
 * Queries only aggregate projections (view or RPC), never raw vote records.
 */
export async function fetchServerVoteCounts() {
  if (!isSupabaseConfigured || !supabase) {
    return {};
  }

  try {
    // 1. Primary: query the aggregate view
    const { data: viewData, error: viewError } = await supabase
      .from('vote_counts')
      .select('item_id, vote_count');

    if (!viewError && Array.isArray(viewData)) {
      const counts = {};
      viewData.forEach(row => {
        counts[row.item_id] = Number(row.vote_count) || 0;
      });
      return counts;
    }

    // 2. Fallback: call the secure aggregate RPC function
    const { data: rpcData, error: rpcError } = await supabase
      .rpc('get_vote_counts');

    if (!rpcError && Array.isArray(rpcData)) {
      const counts = {};
      rpcData.forEach(row => {
        counts[row.item_id] = Number(row.vote_count) || 0;
      });
      return counts;
    }

    return {};
  } catch {
    return {};
  }
}

/**
 * Fetches all item IDs that this specific anonymous voter token has already voted for.
 * Uses a SECURITY DEFINER database function to retrieve ONLY this token's votes
 * without granting public SELECT access to the raw item_votes table.
 */
export async function fetchUserVotedItemIds(voterToken) {
  if (!isSupabaseConfigured || !supabase || !voterToken) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .rpc('get_my_voted_items', { p_voter_token: voterToken });

    if (error || !Array.isArray(data)) {
      return [];
    }

    return data.map(row => (typeof row === 'string' ? row : row.item_id));
  } catch {
    return [];
  }
}
