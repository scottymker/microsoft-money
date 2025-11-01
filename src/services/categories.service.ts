import { supabase } from './supabase';
import type { Category, CategoryType } from '../types';

/**
 * Get all categories for current user
 */
export const getCategories = async (type?: CategoryType) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  let query = supabase
    .from('categories')
    .select('*')
    .eq('user_id', user.id)
    .order('order');

  if (type) {
    query = query.eq('type', type);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Category[];
};

/**
 * Get a single category by ID
 */
export const getCategory = async (id: string) => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Category;
};

/**
 * Create a new category
 */
export const createCategory = async (
  category: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...category,
      user_id: user.id,
    } as any)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
};

/**
 * Update an existing category
 */
export const updateCategory = async (
  id: string,
  updates: Partial<Category>
) => {
  const { data, error } = await supabase
    .from('categories')
    .update(updates as any)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Category;
};

/**
 * Delete a category
 */
export const deleteCategory = async (id: string) => {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
};

/**
 * Get or create default categories for a new user
 */
export const ensureDefaultCategories = async () => {
  const categories = await getCategories();

  if (categories.length === 0) {
    // Create default categories matching the transaction form options
    const defaultCategories = [
      // Income categories
      { name: 'Salary', type: 'income' as CategoryType, color: '#10b981', order: 1 },
      { name: 'Bonus', type: 'income' as CategoryType, color: '#059669', order: 2 },
      { name: 'Investment Income', type: 'income' as CategoryType, color: '#34d399', order: 3 },
      { name: 'Freelance', type: 'income' as CategoryType, color: '#6ee7b7', order: 4 },
      { name: 'Gift Received', type: 'income' as CategoryType, color: '#a7f3d0', order: 5 },
      { name: 'Refund', type: 'income' as CategoryType, color: '#d1fae5', order: 6 },
      { name: 'Other Income', type: 'income' as CategoryType, color: '#6ee7b7', order: 7 },

      // Expense categories
      { name: 'Groceries', type: 'expense' as CategoryType, color: '#ef4444', order: 8 },
      { name: 'Dining Out', type: 'expense' as CategoryType, color: '#f97316', order: 9 },
      { name: 'Transportation', type: 'expense' as CategoryType, color: '#f59e0b', order: 10 },
      { name: 'Gas/Fuel', type: 'expense' as CategoryType, color: '#fbbf24', order: 11 },
      { name: 'Utilities', type: 'expense' as CategoryType, color: '#eab308', order: 12 },
      { name: 'Rent/Mortgage', type: 'expense' as CategoryType, color: '#84cc16', order: 13 },
      { name: 'Insurance', type: 'expense' as CategoryType, color: '#6366f1', order: 14 },
      { name: 'Healthcare', type: 'expense' as CategoryType, color: '#06b6d4', order: 15 },
      { name: 'Entertainment', type: 'expense' as CategoryType, color: '#8b5cf6', order: 16 },
      { name: 'Shopping', type: 'expense' as CategoryType, color: '#ec4899', order: 17 },
      { name: 'Clothing', type: 'expense' as CategoryType, color: '#f472b6', order: 18 },
      { name: 'Personal Care', type: 'expense' as CategoryType, color: '#fb7185', order: 19 },
      { name: 'Education', type: 'expense' as CategoryType, color: '#60a5fa', order: 20 },
      { name: 'Subscriptions', type: 'expense' as CategoryType, color: '#a78bfa', order: 21 },
      { name: 'Gifts', type: 'expense' as CategoryType, color: '#f0abfc', order: 22 },
      { name: 'Charity', type: 'expense' as CategoryType, color: '#fda4af', order: 23 },
      { name: 'Travel', type: 'expense' as CategoryType, color: '#38bdf8', order: 24 },
      { name: 'Home Improvement', type: 'expense' as CategoryType, color: '#facc15', order: 25 },
      { name: 'Pet Care', type: 'expense' as CategoryType, color: '#fb923c', order: 26 },
      { name: 'Fitness', type: 'expense' as CategoryType, color: '#4ade80', order: 27 },
      { name: 'Bank Fees', type: 'expense' as CategoryType, color: '#94a3b8', order: 28 },
      { name: 'Taxes', type: 'expense' as CategoryType, color: '#64748b', order: 29 },
      { name: 'Other Expense', type: 'expense' as CategoryType, color: '#64748b', order: 30 },
      { name: 'Uncategorized', type: 'expense' as CategoryType, color: '#9ca3af', order: 31 },
    ];

    for (const cat of defaultCategories) {
      await createCategory(cat);
    }

    return getCategories();
  }

  return categories;
};
