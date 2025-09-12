import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

// Type definitions for our database tables
export type User = Database['public']['Tables']['users']['Row'];
export type UserInsert = Database['public']['Tables']['users']['Insert'];
export type UserUpdate = Database['public']['Tables']['users']['Update'];

export type Transaction = Database['public']['Tables']['transactions']['Row'];
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];

export type VaultData = Database['public']['Tables']['vault_data']['Row'];
export type VaultDataInsert = Database['public']['Tables']['vault_data']['Insert'];

export type Notification = Database['public']['Tables']['notifications']['Row'];
export type NotificationInsert = Database['public']['Tables']['notifications']['Insert'];

export type UserPreference = Database['public']['Tables']['user_preferences']['Row'];
export type UserPreferenceInsert = Database['public']['Tables']['user_preferences']['Insert'];

// Authentication Service
export class AuthService {
  static async signUp(email: string, password: string, userData?: Partial<UserInsert>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    });
    
    if (error) throw error;
    return data;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  static async signInWithGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`
      }
    });
    
    if (error) throw error;
    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  static async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    
    if (error) throw error;
  }

  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}

// User Profile Service
export class UserService {
  static async createUserProfile(userId: string, profileData: UserInsert) {
    const { data, error } = await supabase
      .from('users')
      .insert([{ id: userId, ...profileData }])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
    return data;
  }

  static async updateUserProfile(userId: string, updates: UserUpdate) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deleteUserProfile(userId: string) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
  }
}

// Transaction Service
export class TransactionService {
  static async createTransaction(transaction: TransactionInsert) {
    const { data, error } = await supabase
      .from('transactions')
      .insert([transaction])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserTransactions(userId: string, limit: number = 50) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async getTransactionById(transactionId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateTransactionStatus(transactionId: string, status: 'pending' | 'confirmed' | 'failed') {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', transactionId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// Vault Data Service
export class VaultService {
  static async updateVaultData(vaultData: VaultDataInsert) {
    const { data, error } = await supabase
      .from('vault_data')
      .upsert([vaultData], { onConflict: 'user_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserVaultData(userId: string) {
    const { data, error } = await supabase
      .from('vault_data')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async getAllVaultData() {
    const { data, error } = await supabase
      .from('vault_data')
      .select('*');
    
    if (error) throw error;
    return data;
  }
}

// Notification Service
export class NotificationService {
  static async createNotification(notification: NotificationInsert) {
    const { data, error } = await supabase
      .from('notifications')
      .insert([notification])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUserNotifications(userId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  static async markNotificationAsRead(notificationId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async markAllNotificationsAsRead(userId: string) {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);
    
    if (error) throw error;
    return data;
  }

  static async deleteNotification(notificationId: string) {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);
    
    if (error) throw error;
  }

  // Real-time notifications subscription
  static subscribeToNotifications(userId: string, callback: (notification: Notification) => void) {
    return supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => callback(payload.new as Notification)
      )
      .subscribe();
  }
}

// User Preferences Service
export class UserPreferencesService {
  static async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateUserPreferences(userId: string, preferences: Partial<UserPreferenceInsert>) {
    const { data, error } = await supabase
      .from('user_preferences')
      .upsert([{ user_id: userId, ...preferences }], { onConflict: 'user_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

// Analytics Service
export class AnalyticsService {
  static async trackEvent(userId: string, event: string, properties?: Record<string, any>) {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([{
        user_id: userId,
        event_name: event,
        properties: properties || {},
        created_at: new Date().toISOString()
      }]);
    
    if (error) throw error;
    return data;
  }

  static async getUserAnalytics(userId: string, days: number = 30) {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}

// Export all services
export const supabaseServices = {
  auth: AuthService,
  users: UserService,
  transactions: TransactionService,
  vault: VaultService,
  notifications: NotificationService,
  preferences: UserPreferencesService,
  analytics: AnalyticsService
};
