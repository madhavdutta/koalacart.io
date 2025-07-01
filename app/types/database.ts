export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          full_name: string | null
          role: 'admin' | 'affiliate' | 'buyer'
          avatar_url: string | null
          stripe_customer_id: string | null
          stripe_account_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          full_name?: string | null
          role?: 'admin' | 'affiliate' | 'buyer'
          avatar_url?: string | null
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          full_name?: string | null
          role?: 'admin' | 'affiliate' | 'buyer'
          avatar_url?: string | null
          stripe_customer_id?: string | null
          stripe_account_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          admin_id: string
          name: string
          description: string | null
          product_type: 'digital' | 'physical'
          pricing_type: 'one_time' | 'subscription' | 'trial'
          base_price: number
          currency: string
          image_url: string | null
          download_url: string | null
          is_active: boolean
          stripe_product_id: string | null
          stripe_price_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          name: string
          description?: string | null
          product_type?: 'digital' | 'physical'
          pricing_type?: 'one_time' | 'subscription' | 'trial'
          base_price?: number
          currency?: string
          image_url?: string | null
          download_url?: string | null
          is_active?: boolean
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          name?: string
          description?: string | null
          product_type?: 'digital' | 'physical'
          pricing_type?: 'one_time' | 'subscription' | 'trial'
          base_price?: number
          currency?: string
          image_url?: string | null
          download_url?: string | null
          is_active?: boolean
          stripe_product_id?: string | null
          stripe_price_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_email: string
          customer_name: string | null
          product_id: string | null
          variant_id: string | null
          affiliate_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          custom_fields: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_email: string
          customer_name?: string | null
          product_id?: string | null
          variant_id?: string | null
          affiliate_id?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          custom_fields?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_email?: string
          customer_name?: string | null
          product_id?: string | null
          variant_id?: string | null
          affiliate_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          custom_fields?: any
          created_at?: string
          updated_at?: string
        }
      }
      affiliates: {
        Row: {
          id: string
          profile_id: string
          admin_id: string
          commission_rate: number
          total_earnings: number
          total_clicks: number
          total_sales: number
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id: string
          admin_id: string
          commission_rate?: number
          total_earnings?: number
          total_clicks?: number
          total_sales?: number
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string
          admin_id?: string
          commission_rate?: number
          total_earnings?: number
          total_clicks?: number
          total_sales?: number
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      affiliate_links: {
        Row: {
          id: string
          affiliate_id: string
          product_id: string
          tracking_code: string
          clicks: number
          conversions: number
          created_at: string
        }
        Insert: {
          id?: string
          affiliate_id: string
          product_id: string
          tracking_code: string
          clicks?: number
          conversions?: number
          created_at?: string
        }
        Update: {
          id?: string
          affiliate_id?: string
          product_id?: string
          tracking_code?: string
          clicks?: number
          conversions?: number
          created_at?: string
        }
      }
      payment_gateways: {
        Row: {
          id: string
          user_id: string
          gateway_type: 'stripe' | 'paypal' | 'square'
          publishable_key: string | null
          secret_key: string | null
          client_id: string | null
          client_secret: string | null
          webhook_secret: string | null
          mode: 'sandbox' | 'live'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          gateway_type: 'stripe' | 'paypal' | 'square'
          publishable_key?: string | null
          secret_key?: string | null
          client_id?: string | null
          client_secret?: string | null
          webhook_secret?: string | null
          mode?: 'sandbox' | 'live'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          gateway_type?: 'stripe' | 'paypal' | 'square'
          publishable_key?: string | null
          secret_key?: string | null
          client_id?: string | null
          client_secret?: string | null
          webhook_secret?: string | null
          mode?: 'sandbox' | 'live'
          is_active?: boolean
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
      user_role: 'admin' | 'affiliate' | 'buyer'
      product_type: 'digital' | 'physical'
      pricing_type: 'one_time' | 'subscription' | 'trial'
      order_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled'
      commission_status: 'pending' | 'approved' | 'paid' | 'cancelled'
    }
  }
}
