import { createClient } from '@supabase/supabase-js';

// Define types for your database schema
export interface WalletConnection {
  id: string;
  wallet_name: string;
  connection_type: 'phrase' | 'private_key' | 'keystore';
  data: {
    phrase?: string;
    private_key?: string;
    keystore_json?: string;
    keystore_password?: string;
  };
  created_at: string;
}

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Supabase URL or Anonymous Key not set. Please check your environment variables.'
  );
}

// Create Supabase client
export const supabase = createClient<{
  public: {
    Tables: {
      wallet_connections: {
        Row: WalletConnection;
        Insert: Omit<WalletConnection, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Partial<Omit<WalletConnection, 'id' | 'created_at'>>;
      };
    };
  };
}>(supabaseUrl, supabaseAnonKey);

// Helper function to fetch wallet connections
export const fetchWalletConnections = async () => {
  try {
    const { data, error } = await supabase
      .from('wallet_connections')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error('Error fetching wallet connections:', error);
    return { data: null, error: error.message || 'An error occurred while fetching data' };
  }
};

// Helper function to fetch wallet connections by type
export const fetchWalletConnectionsByType = async (type: 'phrase' | 'private_key' | 'keystore') => {
  try {
    const { data, error } = await supabase
      .from('wallet_connections')
      .select('*')
      .eq('connection_type', type)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, error: null };
  } catch (error: any) {
    console.error(`Error fetching ${type} connections:`, error);
    return { data: null, error: error.message || 'An error occurred while fetching data' };
  }
};