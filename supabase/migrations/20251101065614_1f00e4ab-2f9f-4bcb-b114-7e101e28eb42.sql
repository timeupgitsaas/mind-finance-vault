-- ════════════════════════════════════════════════════════════
-- 🔐 TIME UP FLOW - PAINEL ADMINISTRATIVO
-- Migration: Admin System with Role-Based Access & Encryption
-- ════════════════════════════════════════════════════════════

-- ┌─────────────────────────────────────────────────────────┐
-- │ 1. ENABLE EXTENSIONS                                     │
-- └─────────────────────────────────────────────────────────┘

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ┌─────────────────────────────────────────────────────────┐
-- │ 2. CREATE ENUM FOR ROLES                                 │
-- └─────────────────────────────────────────────────────────┘

CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'superadmin');

-- ┌─────────────────────────────────────────────────────────┐
-- │ 3. CREATE TABLES                                         │
-- └─────────────────────────────────────────────────────────┘

-- Table: user_roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Table: user_sensitive_data
CREATE TABLE public.user_sensitive_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone_number_encrypted BYTEA,
  cpf_cnpj_encrypted BYTEA,
  address_encrypted BYTEA,
  birth_date_encrypted BYTEA,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: admin_audit_log
CREATE TABLE public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES auth.users(id),
  details JSONB,
  ip_address TEXT,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  next_billing_date DATE,
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL,
  payment_method TEXT,
  plan_type TEXT,
  stripe_payment_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table: plan_limits
CREATE TABLE public.plan_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_type TEXT NOT NULL UNIQUE,
  price_monthly NUMERIC,
  price_yearly NUMERIC,
  max_notes INTEGER DEFAULT 0,
  max_folders INTEGER DEFAULT 0,
  max_transactions INTEGER DEFAULT 0,
  max_ai_messages INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default plan limits
INSERT INTO public.plan_limits (plan_type, price_monthly, price_yearly, max_notes, max_folders, max_transactions, max_ai_messages) VALUES
('free', 0, 0, 30, 3, 50, 10),
('basic', 19.90, 199.00, 100, 10, 200, 100),
('pro', 49.90, 499.00, 0, 0, 0, 500),
('enterprise', 99.90, 999.00, 0, 0, 0, 0);

-- ┌─────────────────────────────────────────────────────────┐
-- │ 4. CREATE SECURITY DEFINER FUNCTIONS                    │
-- └─────────────────────────────────────────────────────────┘

-- Function: Check if user has specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Function: Check if user is admin (admin or superadmin)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id 
    AND role IN ('admin', 'superadmin')
  );
$$;

-- Function: Encrypt text
CREATE OR REPLACE FUNCTION public.encrypt_text(data TEXT, encryption_key TEXT)
RETURNS BYTEA
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, encryption_key);
END;
$$;

-- Function: Decrypt text
CREATE OR REPLACE FUNCTION public.decrypt_text(data BYTEA, encryption_key TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN pgp_sym_decrypt(data, encryption_key);
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

-- ┌─────────────────────────────────────────────────────────┐
-- │ 5. CREATE INDEXES                                        │
-- └─────────────────────────────────────────────────────────┘

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_sensitive_data_user_id ON public.user_sensitive_data(user_id);
CREATE INDEX idx_admin_audit_log_admin_user_id ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_timestamp ON public.admin_audit_log(timestamp DESC);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_created_at ON public.payments(created_at DESC);

-- ┌─────────────────────────────────────────────────────────┐
-- │ 6. ENABLE ROW LEVEL SECURITY                            │
-- └─────────────────────────────────────────────────────────┘

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sensitive_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_limits ENABLE ROW LEVEL SECURITY;

-- ┌─────────────────────────────────────────────────────────┐
-- │ 7. CREATE RLS POLICIES                                  │
-- └─────────────────────────────────────────────────────────┘

-- Policies for user_roles
CREATE POLICY "Users can view their own role"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
  ON public.user_roles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert roles"
  ON public.user_roles FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins can delete roles"
  ON public.user_roles FOR DELETE
  USING (public.is_admin(auth.uid()));

-- Policies for user_sensitive_data
CREATE POLICY "Users can view their own sensitive data"
  ON public.user_sensitive_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all sensitive data"
  ON public.user_sensitive_data FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert their own sensitive data"
  ON public.user_sensitive_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert any sensitive data"
  ON public.user_sensitive_data FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own sensitive data"
  ON public.user_sensitive_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any sensitive data"
  ON public.user_sensitive_data FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Policies for admin_audit_log
CREATE POLICY "Only superadmins can view audit logs"
  ON public.admin_audit_log FOR SELECT
  USING (public.has_role(auth.uid(), 'superadmin'));

CREATE POLICY "Admins can insert audit logs"
  ON public.admin_audit_log FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Policies for subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
  ON public.subscriptions FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can insert their own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can insert any subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can update their own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can update any subscription"
  ON public.subscriptions FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Policies for payments
CREATE POLICY "Users can view their own payments"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON public.payments FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can insert payments"
  ON public.payments FOR INSERT
  WITH CHECK (public.is_admin(auth.uid()));

-- Policies for plan_limits
CREATE POLICY "Everyone can view plan limits"
  ON public.plan_limits FOR SELECT
  USING (true);

CREATE POLICY "Admins can update plan limits"
  ON public.plan_limits FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- ┌─────────────────────────────────────────────────────────┐
-- │ 8. CREATE TRIGGERS                                       │
-- └─────────────────────────────────────────────────────────┘

CREATE TRIGGER update_user_sensitive_data_updated_at
  BEFORE UPDATE ON public.user_sensitive_data
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_plan_limits_updated_at
  BEFORE UPDATE ON public.plan_limits
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ┌─────────────────────────────────────────────────────────┐
-- │ 9. INSERT INITIAL SUPERADMIN                            │
-- └─────────────────────────────────────────────────────────┘

-- This will be executed after user signs up
-- Manual SQL to run after timeuptrafegopago@gmail.com creates account:
-- INSERT INTO public.user_roles (user_id, role, granted_by)
-- SELECT id, 'superadmin', id
-- FROM auth.users
-- WHERE email = 'timeuptrafegopago@gmail.com'
-- ON CONFLICT (user_id, role) DO NOTHING;