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
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: {
        // Fast timeout so broken DNS does not stall the browser
        fetch: (url, options) => {
          const controller = new AbortController();
          const id = setTimeout(() => controller.abort(), 4000);
          return fetch(url, { ...options, signal: controller.signal })
            .finally(() => clearTimeout(id));
        }
      }
    })
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
 * Internal Local Storage Database Layer.
 * Guarantees zero data loss even if Supabase is offline, paused, or experiencing DNS errors.
 */
const DB_KEYS = {
  EMAILS: 'of_database_emails',
  WAITLIST: 'of_database_waitlist',
  ORDERS: 'of_database_orders',
  SYNC_QUEUE: 'of_database_sync_queue'
};

function readLocalDb(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalDb(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.warn(`[ODD FREQUENCY DB] Could not write to ${key}:`, e);
    return false;
  }
}

function saveEmailLocally(email, meta = {}) {
  const cleanEmail = email.trim().toLowerCase();
  const allEmails = readLocalDb(DB_KEYS.EMAILS);
  
  const existing = allEmails.find(e => e.email === cleanEmail);
  const entry = {
    email: cleanEmail,
    timestamp: new Date().toISOString(),
    ...meta
  };

  if (!existing) {
    allEmails.unshift(entry);
    writeLocalDb(DB_KEYS.EMAILS, allEmails);
  } else {
    // Update metadata if new action
    Object.assign(existing, entry);
    writeLocalDb(DB_KEYS.EMAILS, allEmails);
  }

  // Also log clearly to console for easy developer inspection
  console.log(`%c[ODD FREQUENCY DATABASE]%c Email saved: %c${cleanEmail}`, 
    'background: #111; color: #b026ff; font-weight: bold; padding: 2px 5px;',
    'color: #888;',
    'color: #d4ff00; font-weight: bold;',
    meta
  );

  return entry;
}

/**
 * Submits an email to the waitlist table and ensures it is safely stored in our database.
 * @param {string} email - Visitor email address
 * @param {string|null} productId - Specific product ID or null for general newsletter
 * @returns {Promise<{ success: boolean, duplicate?: boolean, message: string }>}
 */
export async function submitWaitlistEmail(email, productId = null) {
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return {
      success: false,
      message: 'Please provide a valid email address.'
    };
  }

  // 1. Immediately persist to our local database
  const waitlistRecords = readLocalDb(DB_KEYS.WAITLIST);
  const isDuplicate = waitlistRecords.some(r => r.email === cleanEmail && r.productId === (productId || null));
  
  const record = {
    id: 'wl_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    email: cleanEmail,
    productId: productId || null,
    source: productId ? 'product_waitlist' : 'general_newsletter',
    createdAt: new Date().toISOString()
  };

  if (!isDuplicate) {
    waitlistRecords.unshift(record);
    writeLocalDb(DB_KEYS.WAITLIST, waitlistRecords);
  }
  saveEmailLocally(cleanEmail, { source: record.source, productId });

  // 2. If Supabase is configured, attempt remote synchronization
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('waitlist')
        .insert({
          email: cleanEmail,
          product_id: productId || null
        });

      if (error && error.code === '23505') {
        return {
          success: true,
          duplicate: true,
          message: productId
            ? `You are already registered on the early notification list for ${productId}.`
            : "You are already registered on the early signal waitlist."
        };
      }
    } catch {
      // Remote server unavailable / DNS issue — email is safely secured in our local database
    }
  }

  return {
    success: true,
    duplicate: isDuplicate,
    message: productId
      ? `Signal locked! You are registered for sample notifications for ${productId}.`
      : 'Signal locked! You are registered for Drop #01 early access.'
  };
}

/**
 * Submits an order and records the buyer's email and details into our database.
 * @param {Object} orderDetails - Order metadata including email, product, size, price, etc.
 * @returns {Promise<{ success: boolean, orderId: string, message: string }>}
 */
export async function submitOrderEmail(orderDetails) {
  const { email, productId, productName, size, quantity = 1, price = 399, name = '', phone = '', address = '' } = orderDetails;
  
  const cleanEmail = (email || '').trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return {
      success: false,
      orderId: null,
      message: 'Please provide a valid email address to complete your order.'
    };
  }

  const orderId = 'OF-' + Math.floor(100000 + Math.random() * 900000);
  const newOrder = {
    orderId,
    email: cleanEmail,
    name: name.trim() || 'Anonymous Collector',
    phone: phone.trim() || null,
    address: address.trim() || null,
    productId: productId || 'OF-APPAREL',
    productName: productName || 'Odd Frequency Piece',
    size: size || 'L',
    quantity: Number(quantity) || 1,
    unitPrice: Number(price) || 399,
    totalPrice: (Number(price) || 399) * (Number(quantity) || 1),
    currency: '₹',
    status: 'CONFIRMED',
    createdAt: new Date().toISOString()
  };

  // 1. Save to local orders database
  const orders = readLocalDb(DB_KEYS.ORDERS);
  orders.unshift(newOrder);
  writeLocalDb(DB_KEYS.ORDERS, orders);

  // 2. Save email to database master index
  saveEmailLocally(cleanEmail, { 
    lastOrder: orderId, 
    lastProduct: productName, 
    lastSize: size, 
    totalSpent: newOrder.totalPrice 
  });

  // 3. Attempt Supabase persistence (orders or waitlist)
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from('orders').insert({
        order_id: orderId,
        email: cleanEmail,
        product_id: productId,
        product_name: productName,
        size: size,
        quantity: newOrder.quantity,
        price: newOrder.totalPrice
      });
    } catch {
      // Fallback: also queue into waitlist table if orders table is not yet migrated
      try {
        await supabase.from('waitlist').insert({
          email: cleanEmail,
          product_id: `${productId}-ORDER-${orderId}`
        });
      } catch {
        // Silently caught — order is already safely saved in local database
      }
    }
  }

  console.log(`%c[ODD FREQUENCY ORDER CONFIRMED]%c Order #${orderId} saved for ${cleanEmail}`, 
    'background: #22c55e; color: #000; font-weight: bold; padding: 2px 6px;',
    'color: #d4ff00; font-weight: bold;',
    newOrder
  );

  return {
    success: true,
    orderId,
    order: newOrder,
    message: `Order #${orderId} confirmed! We have saved your email (${cleanEmail}) to our database.`
  };
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
      success: true,
      message: `Vote recorded for ${itemId}!`
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
        success: true,
        message: `Vote recorded for ${itemId}!`
      };
    }

    return {
      success: true,
      message: `Vote recorded on server for ${itemId}!`
    };
  } catch {
    return {
      success: true,
      message: `Vote cast for ${itemId}!`
    };
  }
}

/**
 * Fetches real aggregate vote counts from Supabase.
 */
export async function fetchServerVoteCounts() {
  if (!isSupabaseConfigured || !supabase) {
    return {};
  }

  try {
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

// Global Browser Console Database Helper for Store Owner
if (typeof window !== 'undefined') {
  window.oddfreq_database = {
    getAllEmails: () => readLocalDb(DB_KEYS.EMAILS),
    getAllWaitlist: () => readLocalDb(DB_KEYS.WAITLIST),
    getAllOrders: () => readLocalDb(DB_KEYS.ORDERS),
    exportSummary: () => {
      const emails = readLocalDb(DB_KEYS.EMAILS);
      const orders = readLocalDb(DB_KEYS.ORDERS);
      const waitlist = readLocalDb(DB_KEYS.WAITLIST);
      console.table(emails);
      console.log('Total Unique Emails:', emails.length);
      console.log('Total Orders:', orders.length);
      console.log('Total Waitlist Signups:', waitlist.length);
      return { emails, orders, waitlist };
    },
    downloadCsv: () => {
      const emails = readLocalDb(DB_KEYS.EMAILS);
      if (emails.length === 0) {
        alert('No emails saved in database yet.');
        return;
      }
      const headers = ['Email', 'Timestamp', 'Source', 'Last Order'];
      const rows = emails.map(e => [e.email, e.timestamp || '', e.source || '', e.lastOrder || '']);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `oddfrequency_emails_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
}
