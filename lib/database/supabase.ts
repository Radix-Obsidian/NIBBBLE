import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for browser/user operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Service client for admin operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Database types
export type Database = {
  public: {
    Tables: {
      grocery_providers: {
        Row: {
          id: string;
          name: string;
          slug: string;
          api_endpoint: string | null;
          api_key_required: boolean;
          logo_url: string | null;
          supported_regions: string[] | null;
          delivery_available: boolean;
          pickup_available: boolean;
          min_order_amount: number | null;
          delivery_fee: number | null;
          created_at: string;
          updated_at: string;
        };
      };
      grocery_stores: {
        Row: {
          id: string;
          provider_id: string;
          name: string;
          address: string;
          city: string;
          state: string;
          zip_code: string;
          latitude: number | null;
          longitude: number | null;
          phone: string | null;
          hours: any | null;
          services: string[] | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      product_categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          icon_name: string | null;
          parent_category_id: string | null;
          sort_order: number;
          created_at: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          brand: string | null;
          category_id: string | null;
          upc_code: string | null;
          description: string | null;
          image_url: string | null;
          unit_type: string;
          organic: boolean;
          gluten_free: boolean;
          vegetarian: boolean;
          vegan: boolean;
          nutrition: any | null;
          allergens: string[] | null;
          ingredients: string[] | null;
          created_at: string;
          updated_at: string;
        };
      };
      store_products: {
        Row: {
          id: string;
          store_id: string;
          product_id: string;
          store_product_id: string | null;
          price: number;
          sale_price: number | null;
          in_stock: boolean;
          stock_quantity: number | null;
          last_updated: string;
        };
      };
      shopping_carts: {
        Row: {
          id: string;
          user_id: string;
          store_id: string | null;
          status: string;
          estimated_total: number;
          tax_amount: number;
          delivery_fee: number;
          created_at: string;
          updated_at: string;
        };
      };
      cart_items: {
        Row: {
          id: string;
          cart_id: string;
          product_id: string;
          recipe_id: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          notes: string | null;
          priority: number;
          created_at: string;
          updated_at: string;
        };
      };
      user_inventory: {
        Row: {
          id: string;
          user_id: string;
          product_id: string | null;
          custom_item_name: string | null;
          quantity: number;
          unit: string;
          expiry_date: string | null;
          purchase_date: string | null;
          location: string | null;
          notes: string | null;
          low_stock_alert: boolean;
          minimum_quantity: number;
          last_updated: string;
        };
      };
      payment_methods: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          provider_payment_id: string;
          type: string;
          last_four: string | null;
          brand: string | null;
          expires_month: number | null;
          expires_year: number | null;
          is_default: boolean;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
      };
      grocery_orders: {
        Row: {
          id: string;
          user_id: string;
          cart_id: string | null;
          store_id: string | null;
          order_number: string;
          status: string;
          subtotal: number;
          tax_amount: number;
          delivery_fee: number;
          service_fee: number;
          tip_amount: number;
          total_amount: number;
          fulfillment_type: string;
          delivery_address: any | null;
          delivery_instructions: string | null;
          scheduled_time: string | null;
          estimated_arrival: string | null;
          actual_delivery_time: string | null;
          payment_method_id: string | null;
          payment_status: string;
          stripe_payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
      };
    };
  };
};