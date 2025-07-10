import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      complaints: {
        Row: {
          id: string
          title: string
          description: string
          category: string
          priority: string
          status: string
          location: string
          latitude: number | null
          longitude: number | null
          date_submitted: string
          upvotes: number
          user_id: string | null
          photos: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category: string
          priority: string
          status?: string
          location: string
          latitude?: number | null
          longitude?: number | null
          date_submitted?: string
          upvotes?: number
          user_id?: string | null
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category?: string
          priority?: string
          status?: string
          location?: string
          latitude?: number | null
          longitude?: number | null
          date_submitted?: string
          upvotes?: number
          user_id?: string | null
          photos?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
