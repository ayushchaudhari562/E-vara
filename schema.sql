-- E-VARA IDENTITY DEFENSE OS
-- DATABASE SCHEMA V1.0

-- 1. Identity Monitoring Table
-- Stores the hashed identifiers for privacy-preserving breach detection.
CREATE TABLE monitored_identities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    identity_type TEXT NOT NULL, -- e.g., 'email', 'username', 'domain'
    identity_value_encrypted TEXT NOT NULL, -- AES-256 encrypted original value
    identity_hash TEXT UNIQUE NOT NULL, -- SHA-256 for fast, private lookups
    risk_score INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    last_scanned_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Breach History Table
-- Records historical leaks found across the surface/dark web.
CREATE TABLE identity_breaches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    identity_id UUID REFERENCES monitored_identities(id) ON DELETE CASCADE,
    source_name TEXT NOT NULL, -- e.g., 'LinkedIn 2021', 'Adobe'
    leak_date DATE,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    data_types TEXT[], -- ['email', 'password', 'phone']
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Security Events (Audit Logs)
-- Immutable logs of all platform activity.
CREATE TABLE security_audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    event_type TEXT NOT NULL, -- 'LOGIN', 'SCAN_INITIATED', 'RECORD_DELETED'
    metadata JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS POLICIES (Security Hardening)
ALTER TABLE monitored_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE identity_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only view their own identities" 
ON monitored_identities FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own identities" 
ON monitored_identities FOR INSERT WITH CHECK (auth.uid() = user_id);

-- DATABASE FUNCTIONS
CREATE OR REPLACE FUNCTION update_last_scanned()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_scanned_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Secure User Profiles
-- Stores verified subscription tiers and operational metadata.
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tier TEXT DEFAULT 'tactical' CHECK (tier IN ('tactical', 'executive', 'omni')),
    node_id_stable TEXT UNIQUE NOT NULL, -- Permanent, deterministic ID
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS for User Profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can only view their own profile" 
ON user_profiles FOR SELECT USING (auth.uid() = id);

-- TRIGGER: Auto-create profile on Auth Signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, node_id_stable)
    VALUES (NEW.id, 'NODE-' || upper(substring(NEW.id::text from 1 for 8)));
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE handle_new_user();

