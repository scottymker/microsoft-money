import { supabase } from './supabase';
import type { SavedFilter } from '../types';

/**
 * Get all saved filters for current user
 */
export const getSavedFilters = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('saved_filters')
    .select('*')
    .eq('user_id', user.id)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as SavedFilter[];
};

/**
 * Get favorite filters
 */
export const getFavoriteFilters = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('saved_filters')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_favorite', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as SavedFilter[];
};

/**
 * Get a single saved filter
 */
export const getSavedFilter = async (id: string) => {
  const { data, error } = await supabase
    .from('saved_filters')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as SavedFilter;
};

/**
 * Create a new saved filter
 */
export const createSavedFilter = async (
  filter: Omit<SavedFilter, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('saved_filters')
    .insert({
      ...filter,
      user_id: user.id,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as SavedFilter;
};

/**
 * Update an existing saved filter
 */
export const updateSavedFilter = async (
  id: string,
  updates: Partial<SavedFilter>
) => {
  const { data, error } = await supabase
    .from('saved_filters')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SavedFilter;
};

/**
 * Delete a saved filter
 */
export const deleteSavedFilter = async (id: string) => {
  const { error } = await supabase
    .from('saved_filters')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

/**
 * Toggle favorite status
 */
export const toggleFilterFavorite = async (id: string) => {
  const filter = await getSavedFilter(id);
  return updateSavedFilter(id, {
    is_favorite: !filter.is_favorite,
  });
};
