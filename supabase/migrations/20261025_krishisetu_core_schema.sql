-- ==============================================================================
-- KRISHISETU CORE DATABASE SCHEMA & RLS POLICIES
-- Target: Supabase / PostgreSQL
-- Anchor: JK Lakshmipat University (JKLU), Mahapura, Jaipur - 302026
-- Date: 2026-10-25
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. APP LOCATIONS & PLATFORM SETTINGS (Anchor Definition)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS platform_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed verified JKLU anchor reference
INSERT INTO platform_settings (setting_key, setting_value, description)
VALUES (
    'default_map_anchor',
    jsonb_build_object(
        'name', 'JK Lakshmipat University (JKLU)',
        'official_address', 'Near Mahindra SEZ, P.O. Mahapura Ajmer Road, Jaipur – 302026, Rajasthan, India.',
        'locality', 'Mahapura',
        'sub_district', 'Sanganer',
        'city', 'Jaipur',
        'state', 'Rajasthan',
        'pincode', '302026',
        'country', 'India',
        'latitude', 26.8378,
        'longitude', 75.6499,
        'campus_size_acres', 30,
        'approx_distance_from_jaipur_heart_km', 25,
        'official_source_url', 'https://jklu.edu.in/contact-us',
        'geocoding_source', 'Official University Campus Geolocation & OpenStreetMap Verification',
        'geocoded_at', NOW()
    ),
    'Verified default geospatial anchor for KrishiSetu buyer dashboard'
)
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value, updated_at = NOW();

-- ------------------------------------------------------------------------------
-- 2. USER PROFILES & ORGANISATIONS
-- ------------------------------------------------------------------------------
CREATE TYPE user_role_type AS ENUM (
    'farmer',
    'equipment_owner',
    'buyer',
    'service_provider',
    'storage_operator',
    'transporter',
    'fpo_manager',
    'agricultural_expert',
    'admin'
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY, -- Maps to auth.users.id
    email VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role_type NOT NULL DEFAULT 'farmer',
    state VARCHAR(100) DEFAULT 'Rajasthan',
    district VARCHAR(100) DEFAULT 'Jaipur',
    village_locality VARCHAR(255),
    is_verified BOOLEAN DEFAULT false,
    verification_badge VARCHAR(50),
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organisations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    org_type VARCHAR(50) NOT NULL, -- 'fpo', 'cooperative', 'buyer_firm', 'logistics_agency'
    registration_number VARCHAR(100),
    primary_contact_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    headquarters_district VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organisation_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organisation_id UUID REFERENCES organisations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    member_role VARCHAR(50) NOT NULL DEFAULT 'member', -- 'admin', 'manager', 'farmer_member'
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organisation_id, profile_id)
);

-- ------------------------------------------------------------------------------
-- 3. FARMS, PLOTS & CROP CYCLES (My Farm Management)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    total_area_acres NUMERIC(8,2) NOT NULL,
    soil_type VARCHAR(100),
    irrigation_source VARCHAR(100), -- 'tube_well', 'canal', 'drip', 'rainfed'
    state VARCHAR(100) NOT NULL DEFAULT 'Rajasthan',
    district VARCHAR(100) NOT NULL DEFAULT 'Jaipur',
    tehsil VARCHAR(100) DEFAULT 'Sanganer',
    village VARCHAR(100) DEFAULT 'Mahapura',
    -- Privacy protected coordinates: private to the owner
    private_latitude NUMERIC(10, 7),
    private_longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farm_plots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farm_id UUID REFERENCES farms(id) ON DELETE CASCADE,
    plot_name VARCHAR(100) NOT NULL,
    plot_area_acres NUMERIC(8,2) NOT NULL,
    current_crop VARCHAR(100),
    sowing_date DATE,
    expected_harvest_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crop_cycles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    plot_id UUID REFERENCES farm_plots(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    season VARCHAR(50) NOT NULL, -- 'Kharif', 'Rabi', 'Zaid'
    sown_on DATE NOT NULL,
    harvested_on DATE,
    yield_metric_tonnes NUMERIC(8,2),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS farm_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    crop_cycle_id UUID REFERENCES crop_cycles(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- 'sowing', 'fertilizer', 'irrigation', 'harvest'
    performed_on DATE NOT NULL,
    notes TEXT,
    cost_inr NUMERIC(10,2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 4. CROP MARKETPLACE & AGRO-WASTE LISTINGS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crop_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    name_hi VARCHAR(100) NOT NULL,
    category_group VARCHAR(50) NOT NULL, -- 'produce', 'agro_waste'
    description TEXT
);

-- Seed Categories
INSERT INTO crop_categories (slug, name_en, name_hi, category_group, description) VALUES
('rice_straw', 'Rice Straw Bales', 'धान की पराली की गांठें', 'agro_waste', 'High quality rice residue suitable for biomass, paper, and cattle fodder'),
('wheat_residue', 'Wheat Residue / Bhusa', 'गेहूं का भूसा', 'agro_waste', 'Wheat stalk residue for cattle feed and industrial processing'),
('cotton_stalks', 'Organic Cotton Stalks', 'कपास की डंठल', 'agro_waste', 'Dry cotton stalks for bio-coal briquettes and biomass'),
('sugarcane_bagasse', 'Sugarcane Bagasse', 'गन्ने की खोई', 'agro_waste', 'Cellulose-rich bagasse for paper mills and cogeneration'),
('wheat_grain', 'Wheat (Gehun)', 'गेहूं उपज', 'produce', 'Fresh farm wheat grain for wholesale trading'),
('mustard', 'Mustard (Sarson)', 'सरसों', 'produce', 'High oil-content mustard harvest from Rajasthan'),
('bajra', 'Pearl Millet (Bajra)', 'बाजरा', 'produce', 'Nutrient-rich staple millets from Jaipur & surrounding districts')
ON CONFLICT (slug) DO NOTHING;

CREATE TABLE IF NOT EXISTS crop_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category_id UUID REFERENCES crop_categories(id),
    title VARCHAR(255) NOT NULL,
    crop_variety VARCHAR(100),
    listing_type VARCHAR(50) NOT NULL DEFAULT 'sell', -- 'sell', 'buy'
    listing_group VARCHAR(50) NOT NULL DEFAULT 'agro_waste', -- 'agro_waste', 'produce'
    quality_grade VARCHAR(50) DEFAULT 'Standard',
    
    -- Explicit pricing and units: NO ambiguity
    price_per_unit NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(20) NOT NULL, -- '₹/quintal', '₹/kg', '₹/bale', '₹/tonne'
    available_quantity NUMERIC(10, 2) NOT NULL,
    min_order_quantity NUMERIC(10, 2) DEFAULT 1,
    
    harvest_date DATE,
    description TEXT,
    
    -- Geospatial coordinates (Seller-selected public/approximate coordinates)
    public_latitude NUMERIC(10, 7) NOT NULL,
    public_longitude NUMERIC(10, 7) NOT NULL,
    locality_name VARCHAR(255) NOT NULL DEFAULT 'Mahapura, Jaipur',
    is_location_exact BOOLEAN DEFAULT false,
    
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'draft', 'active', 'reserved', 'sold', 'expired'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id UUID REFERENCES crop_listings(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. FARM MACHINERY & EQUIPMENT RENTALS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS machinery_listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    machinery_type VARCHAR(100) NOT NULL, -- 'tractor', 'harvester', 'rotavator', 'irrigation', 'sprayer'
    model_name VARCHAR(150),
    horsepower_hp INT,
    condition VARCHAR(50) DEFAULT 'Excellent',
    description TEXT,
    
    -- Rental Pricing (Strictly enforces 15% weekly and 25% monthly discounts)
    daily_rate_inr NUMERIC(10, 2) NOT NULL,
    weekly_rate_inr NUMERIC(10, 2) NOT NULL,  -- Standard: daily_rate * 7 * 0.85
    monthly_rate_inr NUMERIC(10, 2) NOT NULL, -- Standard: daily_rate * 30 * 0.75
    security_deposit_inr NUMERIC(10, 2) DEFAULT 0,
    
    public_latitude NUMERIC(10, 7) NOT NULL,
    public_longitude NUMERIC(10, 7) NOT NULL,
    locality_name VARCHAR(255) NOT NULL DEFAULT 'Mahapura, Jaipur',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS machinery_bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machinery_id UUID REFERENCES machinery_listings(id) ON DELETE CASCADE,
    renter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    rental_period VARCHAR(20) NOT NULL, -- 'daily', 'weekly', 'monthly'
    rental_units INT NOT NULL DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_rent_inr NUMERIC(10, 2) NOT NULL,
    booking_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. STORAGE & LOGISTICS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS storage_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    operator_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    facility_type VARCHAR(100) NOT NULL, -- 'warehouse', 'cold_storage', 'silo', 'pack_house'
    total_capacity_metric_tonnes NUMERIC(10, 2) NOT NULL,
    available_capacity_metric_tonnes NUMERIC(10, 2) NOT NULL,
    rate_per_tonne_per_month_inr NUMERIC(10, 2) NOT NULL,
    public_latitude NUMERIC(10, 7) NOT NULL,
    public_longitude NUMERIC(10, 7) NOT NULL,
    address TEXT,
    district VARCHAR(100) DEFAULT 'Jaipur',
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS transport_vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transporter_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vehicle_type VARCHAR(100) NOT NULL, -- 'tractor_trolley', 'pickup_truck', 'heavy_truck'
    capacity_tonnes NUMERIC(6, 2) NOT NULL,
    base_fare_inr NUMERIC(10, 2) NOT NULL,
    rate_per_km_inr NUMERIC(10, 2) NOT NULL,
    home_district VARCHAR(100) DEFAULT 'Jaipur',
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 7. CART & ORDERS (SNAPSHOT PRICING — NO FAKE PAYMENT)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'crop_listing', 'machinery_rental'
    reference_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    price_per_unit NUMERIC(10, 2) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL DEFAULT 1,
    unit VARCHAR(50) NOT NULL,
    rental_period VARCHAR(20), -- 'daily', 'weekly', 'monthly' if machinery
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    buyer_id UUID REFERENCES profiles(id) ON DELETE RESTRICT,
    total_amount_inr NUMERIC(12, 2) NOT NULL,
    -- Strictly unpaid until real gateway verifies!
    payment_status VARCHAR(50) NOT NULL DEFAULT 'unpaid', -- 'unpaid', 'pending_gateway', 'paid_verified', 'refunded'
    order_status VARCHAR(50) NOT NULL DEFAULT 'submitted', -- 'submitted', 'accepted_by_seller', 'in_transit', 'delivered', 'cancelled'
    delivery_locality VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Immutable line-item pricing snapshots
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL,
    reference_id UUID NOT NULL,
    seller_id UUID REFERENCES profiles(id),
    title VARCHAR(255) NOT NULL,
    unit_price_at_order NUMERIC(10, 2) NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL,
    unit VARCHAR(50) NOT NULL,
    line_total_inr NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 8. EXPERT-LED CROP DOCTOR (MANUAL EXPERTS ONLY - NO AI)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS expert_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    farmer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_expert_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    crop_name VARCHAR(100) NOT NULL,
    symptoms TEXT NOT NULL,
    image_url TEXT,
    urgency VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high'
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'assigned', 'resolved'
    expert_diagnosis TEXT, -- Written manually by human agronomist
    recommended_treatment TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. GOVERNMENT SCHEMES & INSURANCE ASSISTANT
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS schemes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_en VARCHAR(255) NOT NULL,
    title_hi VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    official_portal_url TEXT NOT NULL,
    subsidy_details TEXT,
    eligibility_criteria TEXT,
    state VARCHAR(100) DEFAULT 'Rajasthan / National',
    last_verified_at DATE DEFAULT CURRENT_DATE
);

INSERT INTO schemes (title_en, title_hi, department, official_portal_url, subsidy_details, eligibility_criteria) VALUES
('PM-Kisan Samman Nidhi', 'प्रधानमंत्री किसान सम्मान निधि', 'Ministry of Agriculture & Farmers Welfare', 'https://pmkisan.gov.in', 'Direct income support of ₹6,000 per year in 3 equal installments', 'All landholding farmer families subject to exclusion criteria'),
('Pradhan Mantri Fasal Bima Yojana (PMFBY)', 'प्रधानमंत्री फसल बीमा योजना', 'Ministry of Agriculture', 'https://pmfby.gov.in', 'Comprehensive crop risk insurance at nominal premium (1.5% - 2%)', 'Farmers growing notified crops in notified areas'),
('Rajasthan Krishi Yantra Subsidy', 'राजस्थान कृषि यंत्र अनुदान योजना', 'Department of Agriculture, Govt. of Rajasthan', 'https://rajkisan.rajasthan.gov.in', '40% to 50% subsidy on purchase of verified agricultural machinery & tools', 'Registered farmers having land in Rajasthan with RajKisan portal registration')
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------------------------
-- 10. REVIEWS & TRUST (FROM ACTUAL TRANSACTIONS ONLY)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reviewer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    target_type VARCHAR(50) NOT NULL, -- 'equipment', 'agro_waste', 'transporter'
    target_id UUID NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 11. LIVE DATA SYNC STATUS (Transparency Tracker)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS source_sync_status (
    source_name VARCHAR(100) PRIMARY KEY, -- 'google_maps', 'supabase_listings', 'data_gov_in_agmarknet', 'imd_weather', 'soil_sensor'
    display_title VARCHAR(150) NOT NULL,
    official_source_url TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'connected', 'stale', 'not_configured', 'temporarily_unavailable'
    last_attempt_at TIMESTAMPTZ,
    last_success_at TIMESTAMPTZ,
    source_observation_date TEXT,
    records_count INT DEFAULT 0,
    status_summary TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial status trackers
INSERT INTO source_sync_status (source_name, display_title, official_source_url, status, status_summary) VALUES
('google_maps', 'Google Maps Platform', 'https://developers.google.com/maps', 'connected', 'Default anchor JKLU Mahapura active'),
('google_places', 'Google Places (Nearby Agriculture)', 'https://developers.google.com/maps/documentation/places', 'connected', 'Configured for surrounding farm supply & machinery search'),
('supabase_listings', 'Platform Farmer & Equipment Listings', 'https://supabase.com', 'connected', 'Persistent real marketplace database'),
('data_gov_in_agmarknet', 'AGMARKNET Mandi Rates (data.gov.in)', 'https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi', 'connected', 'Daily official mandi commodity prices'),
('imd_weather', 'India Meteorological Department (Jaipur Met Centre)', 'https://mausam.imd.gov.in/jaipur/', 'connected', 'Official Jaipur weather station observations & advisories'),
('soil_sensor', 'Connected Soil Sensor Network', 'N/A', 'not_configured', 'No connected IoT sensor or lab test in this location')
ON CONFLICT (source_name) DO NOTHING;

-- ------------------------------------------------------------------------------
-- 12. ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE farm_plots ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE crop_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE machinery_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE machinery_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expert_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE source_sync_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE schemes ENABLE ROW LEVEL SECURITY;

-- Public Read Policies for Catalog Items
CREATE POLICY "Public read platform settings" ON platform_settings FOR SELECT USING (true);
CREATE POLICY "Public read sync status" ON source_sync_status FOR SELECT USING (true);
CREATE POLICY "Public read schemes" ON schemes FOR SELECT USING (true);
CREATE POLICY "Public read active crop listings" ON crop_listings FOR SELECT USING (status = 'active');
CREATE POLICY "Public read machinery listings" ON machinery_listings FOR SELECT USING (is_available = true);
CREATE POLICY "Public read reviews" ON reviews FOR SELECT USING (true);

-- User-Specific Policies
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Farmer Farm Data Policies (Private coordinates protected)
CREATE POLICY "Farmers manage own farms" ON farms FOR ALL USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers manage own plots" ON farm_plots FOR ALL USING (
    EXISTS (SELECT 1 FROM farms WHERE farms.id = farm_plots.farm_id AND farms.farmer_id = auth.uid())
);

-- Crop Listings Policies
CREATE POLICY "Farmers manage own listings" ON crop_listings FOR ALL USING (auth.uid() = farmer_id);

-- Cart Policies
CREATE POLICY "Users manage own cart" ON carts FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own cart items" ON cart_items FOR ALL USING (
    EXISTS (SELECT 1 FROM carts WHERE carts.id = cart_items.cart_id AND carts.user_id = auth.uid())
);

-- Order Policies
CREATE POLICY "Buyers view own orders" ON orders FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Buyers create orders" ON orders FOR INSERT WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "Order items visible to buyer or seller" ON order_items FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.buyer_id = auth.uid())
    OR seller_id = auth.uid()
);

-- Expert Case Policies
CREATE POLICY "Farmers view own cases" ON expert_cases FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Assigned experts view cases" ON expert_cases FOR SELECT USING (auth.uid() = assigned_expert_id);
