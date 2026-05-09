export type UserRole = "user" | "rider" | "admin";

export type User = {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  role: UserRole;
  is_active: boolean;
  email_verified: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Pricing = {
  id: string;
  base_fare: number;
  per_km_rate: number;
  vehicle_multiplier: number;
  surge_active: boolean;
  surge_multiplier: number;
  min_fare: number;
  max_fare: number | null;
  updated_at: string;
  vehicle_type: string | null;
};

