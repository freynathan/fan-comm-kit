export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      brand_collabs: {
        Row: {
          brand_logo_url: string | null
          brand_name: string
          created_at: string
          engagement_rate: number | null
          id: string
          post_count: number | null
          reach: number | null
          role: string | null
          site_id: string | null
          user_id: string
          year: number | null
        }
        Insert: {
          brand_logo_url?: string | null
          brand_name: string
          created_at?: string
          engagement_rate?: number | null
          id?: string
          post_count?: number | null
          reach?: number | null
          role?: string | null
          site_id?: string | null
          user_id: string
          year?: number | null
        }
        Update: {
          brand_logo_url?: string | null
          brand_name?: string
          created_at?: string
          engagement_rate?: number | null
          id?: string
          post_count?: number | null
          reach?: number | null
          role?: string | null
          site_id?: string | null
          user_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_collabs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_collabs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_clubs: {
        Row: {
          accent_color: string | null
          created_at: string
          description: string | null
          id: string
          is_free: boolean
          member_count: number
          name: string
          owner_id: string
          price: number | null
          site_id: string | null
        }
        Insert: {
          accent_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          member_count?: number
          name: string
          owner_id: string
          price?: number | null
          site_id?: string | null
        }
        Update: {
          accent_color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_free?: boolean
          member_count?: number
          name?: string
          owner_id?: string
          price?: number | null
          site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fan_clubs_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fan_clubs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      passion_points: {
        Row: {
          created_at: string
          id: string
          level: string
          points: number
          site_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string
          points?: number
          site_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          points?: number
          site_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "passion_points_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "passion_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bio: string | null
          created_at: string
          headline: string | null
          hire_available: boolean
          id: string
          location: string | null
          updated_at: string
          user_id: string
          verified: boolean
        }
        Insert: {
          bio?: string | null
          created_at?: string
          headline?: string | null
          hire_available?: boolean
          id?: string
          location?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean
        }
        Update: {
          bio?: string | null
          created_at?: string
          headline?: string | null
          hire_available?: boolean
          id?: string
          location?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      relationships: {
        Row: {
          created_at: string
          from_user_id: string
          id: string
          relationship_type: string
          to_user_id: string
        }
        Insert: {
          created_at?: string
          from_user_id: string
          id?: string
          relationship_type?: string
          to_user_id: string
        }
        Update: {
          created_at?: string
          from_user_id?: string
          id?: string
          relationship_type?: string
          to_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "relationships_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "relationships_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          accent_color: string
          ai_feature_label: string | null
          cluster: string | null
          created_at: string
          description: string | null
          domain: string | null
          emoji: string
          id: string
          is_active: boolean
          name: string
          slug: string | null
        }
        Insert: {
          accent_color?: string
          ai_feature_label?: string | null
          cluster?: string | null
          created_at?: string
          description?: string | null
          domain?: string | null
          emoji?: string
          id?: string
          is_active?: boolean
          name: string
          slug?: string | null
        }
        Update: {
          accent_color?: string
          ai_feature_label?: string | null
          cluster?: string | null
          created_at?: string
          description?: string | null
          domain?: string | null
          emoji?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          display_order: number
          follower_count: number
          handle: string | null
          id: string
          platform: string
          url: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          follower_count?: number
          handle?: string | null
          id?: string
          platform: string
          url?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          display_order?: number
          follower_count?: number
          handle?: string | null
          id?: string
          platform?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_links_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string
          id: string
          initials: string
          updated_at: string
          username: string
        }
        Insert: {
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email: string
          id?: string
          initials?: string
          updated_at?: string
          username: string
        }
        Update: {
          auth_id?: string | null
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          initials?: string
          updated_at?: string
          username?: string
        }
        Relationships: []
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
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
