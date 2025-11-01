// Supabase Database Types
// This will be auto-generated once we create the Supabase schema

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          balance: number
          opening_balance: number
          currency: string
          institution: string | null
          account_number: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          balance?: number
          opening_balance: number
          currency?: string
          institution?: string | null
          account_number?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          balance?: number
          opening_balance?: number
          currency?: string
          institution?: string | null
          account_number?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          account_id: string
          date: string
          amount: number
          payee: string
          category: string
          subcategory: string | null
          memo: string | null
          reconciled: boolean
          splits: Json | null
          import_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          account_id: string
          date: string
          amount: number
          payee: string
          category?: string
          subcategory?: string | null
          memo?: string | null
          reconciled?: boolean
          splits?: Json | null
          import_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          date?: string
          amount?: number
          payee?: string
          category?: string
          subcategory?: string | null
          memo?: string | null
          reconciled?: boolean
          splits?: Json | null
          import_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          type: string
          parent_id: string | null
          color: string
          icon: string | null
          order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          type: string
          parent_id?: string | null
          color: string
          icon?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: string
          parent_id?: string | null
          color?: string
          icon?: string | null
          order?: number
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          period: string
          start_date: string
          rollover: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          period: string
          start_date: string
          rollover?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          period?: string
          start_date?: string
          rollover?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
