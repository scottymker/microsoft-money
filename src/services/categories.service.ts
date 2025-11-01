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
    // Create default categories
    const defaultCategories = [
      // Income categories
      { name: 'Salary', type: 'income' as CategoryType, color: '#10b981', order: 1 },
      { name: 'Freelance', type: 'income' as CategoryType, color: '#34d399', order: 2 },
      { name: 'Investments', type: 'income' as CategoryType, color: '#6ee7b7', order: 3 },
      { name: 'Other Income', type: 'income' as CategoryType, color: '#a7f3d0', order: 4 },

      // Expense categories
      { name: 'Groceries', type: 'expense' as CategoryType, color: '#ef4444', order: 5 },
      { name: 'Dining', type: 'expense' as CategoryType, color: '#f97316', order: 6 },
      { name: 'Transportation', type: 'expense' as CategoryType, color: '#f59e0b', order: 7 },
      { name: 'Utilities', type: 'expense' as CategoryType, color: '#eab308', order: 8 },
      { name: 'Rent/Mortgage', type: 'expense' as CategoryType, color: '#84cc16', order: 9 },
      { name: 'Healthcare', type: 'expense' as CategoryType, color: '#06b6d4', order: 10 },
      { name: 'Entertainment', type: 'expense' as CategoryType, color: '#8b5cf6', order: 11 },
      { name: 'Shopping', type: 'expense' as CategoryType, color: '#ec4899', order: 12 },
      { name: 'Insurance', type: 'expense' as CategoryType, color: '#6366f1', order: 13 },
      { name: 'Other Expenses', type: 'expense' as CategoryType, color: '#64748b', order: 14 },
    ];

    for (const cat of defaultCategories) {
      await createCategory(cat);
    }

    return getCategories();
  }

  return categories;
};
