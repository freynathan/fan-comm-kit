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
      bookmarks: {
        Row: {
          article_id: string | null
          created_at: string
          id: string
          post_id: string | null
          synopsis_id: string | null
          user_id: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          synopsis_id?: string | null
          user_id: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          id?: string
          post_id?: string | null
          synopsis_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_synopsis_id_fkey"
            columns: ["synopsis_id"]
            isOneToOne: false
            referencedRelation: "news_synopses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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
      content_dispatches: {
        Row: {
          article_id: string | null
          dispatch_reason: string | null
          dispatched_at: string
          dispatched_to_site_id: string | null
          id: string
          source_site_id: string | null
          synopsis_id: string | null
        }
        Insert: {
          article_id?: string | null
          dispatch_reason?: string | null
          dispatched_at?: string
          dispatched_to_site_id?: string | null
          id?: string
          source_site_id?: string | null
          synopsis_id?: string | null
        }
        Update: {
          article_id?: string | null
          dispatch_reason?: string | null
          dispatched_at?: string
          dispatched_to_site_id?: string | null
          id?: string
          source_site_id?: string | null
          synopsis_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_dispatches_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_dispatches_dispatched_to_site_id_fkey"
            columns: ["dispatched_to_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_dispatches_source_site_id_fkey"
            columns: ["source_site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_dispatches_synopsis_id_fkey"
            columns: ["synopsis_id"]
            isOneToOne: false
            referencedRelation: "news_synopses"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_club_invitations: {
        Row: {
          club_id: string
          code: string
          created_at: string
          email: string | null
          expires_at: string | null
          id: string
          invited_by: string | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          club_id: string
          code: string
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          club_id?: string
          code?: string
          created_at?: string
          email?: string | null
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fan_club_invitations_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "fan_clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fan_club_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fan_club_invitations_used_by_fkey"
            columns: ["used_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      fan_club_memberships: {
        Row: {
          club_id: string
          id: string
          joined_at: string
          status: string
          user_id: string
        }
        Insert: {
          club_id: string
          id?: string
          joined_at?: string
          status?: string
          user_id: string
        }
        Update: {
          club_id?: string
          id?: string
          joined_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_club_memberships_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "fan_clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fan_club_memberships_user_id_fkey"
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
          benefits: string[] | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          fan_trust_score: number
          id: string
          is_free: boolean
          member_count: number
          name: string
          owner_id: string
          post_count: number
          price: number | null
          price_monthly: number | null
          site_id: string | null
          site_slug: string | null
          slug: string | null
          tagline: string | null
          visibility: string
          welcome_message: string | null
        }
        Insert: {
          accent_color?: string | null
          benefits?: string[] | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          fan_trust_score?: number
          id?: string
          is_free?: boolean
          member_count?: number
          name: string
          owner_id: string
          post_count?: number
          price?: number | null
          price_monthly?: number | null
          site_id?: string | null
          site_slug?: string | null
          slug?: string | null
          tagline?: string | null
          visibility?: string
          welcome_message?: string | null
        }
        Update: {
          accent_color?: string | null
          benefits?: string[] | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          fan_trust_score?: number
          id?: string
          is_free?: boolean
          member_count?: number
          name?: string
          owner_id?: string
          post_count?: number
          price?: number | null
          price_monthly?: number | null
          site_id?: string | null
          site_slug?: string | null
          slug?: string | null
          tagline?: string | null
          visibility?: string
          welcome_message?: string | null
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
      fan_trust_events: {
        Row: {
          club_id: string
          created_at: string
          description: string | null
          event_type: string
          id: string
          points_awarded: number
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          description?: string | null
          event_type: string
          id?: string
          points_awarded?: number
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          description?: string | null
          event_type?: string
          id?: string
          points_awarded?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fan_trust_events_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "fan_clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fan_trust_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          created_at: string
          id: string
          is_duplicate: boolean
          original_author: string | null
          original_content: string | null
          original_published_at: string | null
          original_title: string
          original_url: string
          quality_score: number
          relevance_score: number
          site_id: string | null
          source_id: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_duplicate?: boolean
          original_author?: string | null
          original_content?: string | null
          original_published_at?: string | null
          original_title: string
          original_url: string
          quality_score?: number
          relevance_score?: number
          site_id?: string | null
          source_id?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_duplicate?: boolean
          original_author?: string | null
          original_content?: string | null
          original_published_at?: string | null
          original_title?: string
          original_url?: string
          quality_score?: number
          relevance_score?: number
          site_id?: string | null
          source_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_articles_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_articles_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "news_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      news_sources: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          last_scanned_at: string | null
          reliability_score: number
          site_id: string | null
          source_name: string
          source_type: string
          source_url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_scanned_at?: string | null
          reliability_score?: number
          site_id?: string | null
          source_name: string
          source_type?: string
          source_url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          last_scanned_at?: string | null
          reliability_score?: number
          site_id?: string | null
          source_name?: string
          source_type?: string
          source_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_sources_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      news_synopses: {
        Row: {
          article_id: string | null
          created_at: string
          entity_page_ids: string[] | null
          fan_angle: string | null
          id: string
          key_points: Json | null
          post_id: string | null
          reading_time_seconds: number
          site_id: string | null
          synopsis_content: string
          title: string
        }
        Insert: {
          article_id?: string | null
          created_at?: string
          entity_page_ids?: string[] | null
          fan_angle?: string | null
          id?: string
          key_points?: Json | null
          post_id?: string | null
          reading_time_seconds?: number
          site_id?: string | null
          synopsis_content: string
          title: string
        }
        Update: {
          article_id?: string | null
          created_at?: string
          entity_page_ids?: string[] | null
          fan_angle?: string | null
          id?: string
          key_points?: Json | null
          post_id?: string | null
          reading_time_seconds?: number
          site_id?: string | null
          synopsis_content?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "news_synopses_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_synopses_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_synopses_site_id_fkey"
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
      post_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          ai_analysis: Json | null
          author_id: string | null
          comment_count: number
          content: string | null
          content_type: string
          created_at: string
          embed_platform: string | null
          embed_thumbnail: string | null
          embed_url: string | null
          entity_page_id: string | null
          id: string
          love_count: number
          media_urls: string[] | null
          site_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          author_id?: string | null
          comment_count?: number
          content?: string | null
          content_type?: string
          created_at?: string
          embed_platform?: string | null
          embed_thumbnail?: string | null
          embed_url?: string | null
          entity_page_id?: string | null
          id?: string
          love_count?: number
          media_urls?: string[] | null
          site_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          author_id?: string | null
          comment_count?: number
          content?: string | null
          content_type?: string
          created_at?: string
          embed_platform?: string | null
          embed_thumbnail?: string | null
          embed_url?: string | null
          entity_page_id?: string | null
          id?: string
          love_count?: number
          media_urls?: string[] | null
          site_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
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
