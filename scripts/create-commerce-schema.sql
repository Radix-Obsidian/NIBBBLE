-- PantryPals Commerce Infrastructure Database Schema
-- Tier 2: Complete shopping cart, inventory, and payment system

-- ================================================
-- GROCERY STORES & PROVIDERS
-- ================================================

-- Grocery store providers (Kroger, Safeway, Instacart, etc.)
CREATE TABLE IF NOT EXISTS grocery_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  api_endpoint VARCHAR(500),
  api_key_required BOOLEAN DEFAULT true,
  logo_url VARCHAR(500),
  supported_regions TEXT[], -- Array of states/regions
  delivery_available BOOLEAN DEFAULT true,
  pickup_available BOOLEAN DEFAULT true,
  min_order_amount DECIMAL(10,2),
  delivery_fee DECIMAL(8,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual store locations
CREATE TABLE IF NOT EXISTS grocery_stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID REFERENCES grocery_providers(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(50) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  latitude DECIMAL(10,8),
  longitude DECIMAL(11,8),
  phone VARCHAR(20),
  hours JSONB, -- Store hours by day
  services TEXT[], -- ['delivery', 'pickup', 'curbside']
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- PRODUCT CATALOG & INVENTORY
-- ================================================

-- Product categories (produce, dairy, meat, etc.)
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_name VARCHAR(50), -- lucide icon name
  parent_category_id UUID REFERENCES product_categories(id),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Master product catalog
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  category_id UUID REFERENCES product_categories(id),
  upc_code VARCHAR(50),
  description TEXT,
  image_url VARCHAR(500),
  unit_type VARCHAR(20) NOT NULL, -- 'each', 'lb', 'oz', 'gallon', etc.
  organic BOOLEAN DEFAULT false,
  gluten_free BOOLEAN DEFAULT false,
  vegetarian BOOLEAN DEFAULT false,
  vegan BOOLEAN DEFAULT false,
  nutrition JSONB, -- Nutritional information
  allergens TEXT[], -- Common allergens
  ingredients TEXT[], -- Ingredient list for processed foods
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Store-specific product availability and pricing
CREATE TABLE IF NOT EXISTS store_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES grocery_stores(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  store_product_id VARCHAR(100), -- Store's internal product ID
  price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2),
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER,
  last_updated TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(store_id, product_id)
);

-- ================================================
-- SHOPPING CART & PROCUREMENT
-- ================================================

-- User shopping carts
CREATE TABLE IF NOT EXISTS shopping_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  store_id UUID REFERENCES grocery_stores(id),
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'checked_out', 'abandoned'
  estimated_total DECIMAL(10,2) DEFAULT 0,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Items in shopping cart
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES shopping_carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id), -- Optional: which recipe needs this item
  quantity DECIMAL(8,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  notes TEXT, -- User notes about substitutions, preferences
  priority INTEGER DEFAULT 1, -- 1=essential, 2=preferred, 3=optional
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Smart ingredient procurement suggestions
CREATE TABLE IF NOT EXISTS ingredient_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  original_ingredient VARCHAR(255) NOT NULL,
  suggested_product_id UUID REFERENCES products(id),
  confidence_score DECIMAL(3,2), -- 0.00-1.00
  reasoning TEXT,
  price_comparison JSONB, -- Compare prices across stores
  nutritional_impact JSONB, -- How it affects recipe nutrition
  user_feedback VARCHAR(20), -- 'accepted', 'rejected', 'modified'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INVENTORY MANAGEMENT
-- ================================================

-- User's pantry inventory
CREATE TABLE IF NOT EXISTS user_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  custom_item_name VARCHAR(255), -- For non-catalog items
  quantity DECIMAL(8,2) NOT NULL DEFAULT 0,
  unit VARCHAR(20) NOT NULL,
  expiry_date DATE,
  purchase_date DATE,
  location VARCHAR(100), -- 'pantry', 'fridge', 'freezer'
  notes TEXT,
  low_stock_alert BOOLEAN DEFAULT false,
  minimum_quantity DECIMAL(8,2) DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory alerts and notifications
CREATE TABLE IF NOT EXISTS inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  inventory_id UUID REFERENCES user_inventory(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL, -- 'expiring_soon', 'low_stock', 'expired'
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- PAYMENT PROCESSING
-- ================================================

-- Payment methods (Stripe, PayPal, etc.)
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'stripe', 'paypal', 'apple_pay'
  provider_payment_id VARCHAR(255) NOT NULL, -- Stripe payment method ID
  type VARCHAR(50) NOT NULL, -- 'card', 'bank_account', 'digital_wallet'
  last_four VARCHAR(4), -- Last 4 digits for cards
  brand VARCHAR(50), -- 'visa', 'mastercard', etc.
  expires_month INTEGER,
  expires_year INTEGER,
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order history and tracking
CREATE TABLE IF NOT EXISTS grocery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cart_id UUID REFERENCES shopping_carts(id),
  store_id UUID REFERENCES grocery_stores(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled'
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  service_fee DECIMAL(10,2) DEFAULT 0,
  tip_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  
  -- Fulfillment
  fulfillment_type VARCHAR(20) NOT NULL, -- 'delivery', 'pickup'
  delivery_address JSONB, -- Full delivery address
  delivery_instructions TEXT,
  scheduled_time TIMESTAMPTZ,
  estimated_arrival TIMESTAMPTZ,
  actual_delivery_time TIMESTAMPTZ,
  
  -- Payment
  payment_method_id UUID REFERENCES payment_methods(id),
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded'
  stripe_payment_intent_id VARCHAR(255),
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual items in completed orders
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES grocery_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name VARCHAR(255) NOT NULL, -- Snapshot at time of order
  quantity DECIMAL(8,2) NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  substitution_notes TEXT, -- If item was substituted
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- SMART PROCUREMENT ANALYTICS
-- ================================================

-- Track user purchasing patterns for AI optimization
CREATE TABLE IF NOT EXISTS purchase_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  category_id UUID REFERENCES product_categories(id),
  purchase_frequency INTEGER, -- Days between purchases
  seasonal_preference JSONB, -- Buying patterns by season
  price_sensitivity DECIMAL(3,2), -- 0.00-1.00, how price affects buying
  brand_loyalty DECIMAL(3,2), -- 0.00-1.00, tendency to stick with brands
  organic_preference DECIMAL(3,2), -- 0.00-1.00, preference for organic
  bulk_buying_tendency DECIMAL(3,2), -- 0.00-1.00, tendency to buy in bulk
  last_calculated TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Real-time inventory checking log
CREATE TABLE IF NOT EXISTS inventory_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  product_id UUID REFERENCES products(id),
  store_id UUID REFERENCES grocery_stores(id),
  check_type VARCHAR(50), -- 'availability', 'price', 'both'
  result JSONB, -- API response data
  in_stock BOOLEAN,
  price DECIMAL(10,2),
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

-- User-specific indexes
CREATE INDEX IF NOT EXISTS idx_shopping_carts_user_id ON shopping_carts(user_id);
CREATE INDEX IF NOT EXISTS idx_user_inventory_user_id ON user_inventory(user_id);
CREATE INDEX IF NOT EXISTS idx_grocery_orders_user_id ON grocery_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_user_id ON payment_methods(user_id);

-- Geographic indexes for store lookup
CREATE INDEX IF NOT EXISTS idx_grocery_stores_location ON grocery_stores(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_grocery_stores_city_state ON grocery_stores(city, state);

-- Product catalog indexes
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_upc_code ON products(upc_code);
CREATE INDEX IF NOT EXISTS idx_store_products_store_id ON store_products(store_id);
CREATE INDEX IF NOT EXISTS idx_store_products_product_id ON store_products(product_id);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_user_id ON inventory_alerts(user_id, is_read);

-- ================================================
-- ROW LEVEL SECURITY (RLS)
-- ================================================

-- Enable RLS on user-specific tables
ALTER TABLE shopping_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE grocery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_analytics ENABLE ROW LEVEL SECURITY;

-- Shopping cart policies
CREATE POLICY "Users can manage their own shopping carts" ON shopping_carts
  FOR ALL USING (auth.uid() = user_id);

-- Cart items policies  
CREATE POLICY "Users can manage their cart items" ON cart_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM shopping_carts sc 
      WHERE sc.id = cart_items.cart_id AND sc.user_id = auth.uid()
    )
  );

-- Inventory policies
CREATE POLICY "Users can manage their own inventory" ON user_inventory
  FOR ALL USING (auth.uid() = user_id);

-- Inventory alerts policies
CREATE POLICY "Users can view their own inventory alerts" ON inventory_alerts
  FOR ALL USING (auth.uid() = user_id);

-- Payment method policies
CREATE POLICY "Users can manage their own payment methods" ON payment_methods
  FOR ALL USING (auth.uid() = user_id);

-- Order policies
CREATE POLICY "Users can view their own orders" ON grocery_orders
  FOR ALL USING (auth.uid() = user_id);

-- Analytics policies
CREATE POLICY "Users can view their own purchase analytics" ON purchase_analytics
  FOR ALL USING (auth.uid() = user_id);

-- ================================================
-- SAMPLE DATA FOR TESTING
-- ================================================

-- Insert sample grocery providers
INSERT INTO grocery_providers (name, slug, supported_regions, delivery_available, pickup_available) VALUES 
('Kroger', 'kroger', ARRAY['OH', 'KY', 'IN', 'MI', 'IL', 'TX', 'GA'], true, true),
('Safeway', 'safeway', ARRAY['CA', 'WA', 'OR', 'NV', 'AZ'], true, true),
('Instacart', 'instacart', ARRAY['CA', 'NY', 'TX', 'FL', 'IL', 'PA'], true, false),
('Walmart Grocery', 'walmart', ARRAY['AL', 'AK', 'AZ', 'AR', 'CA', 'CO'], true, true),
('Amazon Fresh', 'amazon-fresh', ARRAY['WA', 'CA', 'NY', 'FL', 'TX'], true, false);

-- Insert sample product categories
INSERT INTO product_categories (name, slug, icon_name, sort_order) VALUES 
('Produce', 'produce', 'Carrot', 1),
('Dairy & Eggs', 'dairy-eggs', 'Milk', 2),
('Meat & Seafood', 'meat-seafood', 'Fish', 3),
('Pantry Staples', 'pantry-staples', 'Package', 4),
('Frozen Foods', 'frozen-foods', 'Snowflake', 5),
('Beverages', 'beverages', 'Coffee', 6),
('Snacks', 'snacks', 'Cookie', 7),
('Health & Beauty', 'health-beauty', 'Heart', 8);

-- Insert sample products
INSERT INTO products (name, brand, category_id, unit_type, organic, nutrition) VALUES 
('Organic Bananas', 'Store Brand', (SELECT id FROM product_categories WHERE slug = 'produce'), 'lb', true, '{"calories": 89, "fiber": 3, "potassium": 358}'),
('Whole Milk', 'Horizon', (SELECT id FROM product_categories WHERE slug = 'dairy-eggs'), 'gallon', true, '{"calories": 150, "protein": 8, "calcium": 280}'),
('Ground Beef 80/20', 'Store Brand', (SELECT id FROM product_categories WHERE slug = 'meat-seafood'), 'lb', false, '{"calories": 287, "protein": 19, "fat": 23}'),
('Olive Oil Extra Virgin', 'Bertolli', (SELECT id FROM product_categories WHERE slug = 'pantry-staples'), 'each', false, '{"calories": 884, "fat": 100}'),
('Frozen Broccoli', 'Birds Eye', (SELECT id FROM product_categories WHERE slug = 'frozen-foods'), 'each', false, '{"calories": 25, "fiber": 3, "vitamin_c": 81}');

COMMENT ON TABLE grocery_providers IS 'Third-party grocery delivery and pickup services';
COMMENT ON TABLE products IS 'Master catalog of all grocery products with nutrition data';
COMMENT ON TABLE shopping_carts IS 'User shopping carts with smart procurement optimization';
COMMENT ON TABLE user_inventory IS 'Real-time pantry inventory tracking with expiry alerts';
COMMENT ON TABLE grocery_orders IS 'Complete order history with Stripe payment integration';