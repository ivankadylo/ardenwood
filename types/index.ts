export type Role = 'customer' | 'admin';

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  phone_verified: boolean;
  role: Role;
  discount_percent: number;
  stripe_customer_id: string | null;
  gdpr_consent: boolean;
  marketing_consent: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  slug: string;
  name_en: string;
  name_de: string | null;
  name_fr: string | null;
  name_cs: string | null;
  name_pl: string | null;
  name_it: string | null;
  name_es: string | null;
  name_nl: string | null;
  name_sk: string | null;
  name_uk: string | null;
  category: string;
  price_czk: number;
  price_from: boolean;
  discount_percent: number;
  discount_for_members_only: boolean;
  photos: string[];
  video_url: string | null;
  description_en: string | null;
  description_cs: string | null;
  edge_options: string[];
  shade_options: string[];
  frame_options: string[];
  views_count: number;
  in_stock: boolean;
  is_active: boolean;
  created_at: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'in_production' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  user_id: string | null;
  guest_email: string | null;
  status: OrderStatus;
  items: any; // JSONB
  total_czk: number;
  total_eur: number | null;
  currency: string;
  stripe_payment_intent_id: string | null;
  payment_status: string;
  shipping_name: string | null;
  shipping_address: string | null;
  shipping_city: string | null;
  shipping_zip: string | null;
  shipping_country: string;
  note: string | null;
  created_at: string;
}

export interface CurrencyRate {
  id: string;
  code: string;
  name: string;
  rate_to_czk: number;
  rounding_rule: string;
  is_auto: boolean;
  is_active: boolean;
  updated_at: string;
}

export interface PhoneVerification {
  id: string;
  phone: string;
  code: string;
  expires_at: string;
  used: boolean;
  created_at: string;
}
