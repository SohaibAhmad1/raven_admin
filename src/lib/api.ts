import { getStoredToken } from "./auth";
import type { Pricing, User } from "./models";

type ValidationError = {
  field: string;
  message: string;
};

type ApiErrorPayload = {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: ValidationError[];
};

type RequestConfig = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  auth?: boolean;
  body?: unknown;
};

export class ApiError extends Error {
  status: number;
  errors: ValidationError[];

  constructor(message: string, status: number, errors: ValidationError[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

const baseUrl = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");

function resolveUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return baseUrl ? `${baseUrl}${normalizedPath}` : normalizedPath;
}

async function request<T>(path: string, config: RequestConfig = {}): Promise<T> {
  const { method = "GET", auth = true, body } = config;
  const token = getStoredToken();

  if (auth && !token) {
    throw new ApiError("Authentication token is missing. Please log in again.", 401);
  }

  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (auth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(resolveUrl(path), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let json: ApiErrorPayload | T | null = null;

  if (text) {
    try {
      json = JSON.parse(text) as ApiErrorPayload | T;
    } catch {
      json = null;
    }
  }

  if (!response.ok) {
    const payload = (json || {}) as ApiErrorPayload;
    throw new ApiError(
      payload.message || payload.error || `Request failed with status ${response.status}`,
      response.status,
      payload.errors || [],
    );
  }

  return json as T;
}

type LoginResponse = {
  success: true;
  message: string;
  data: {
    user: User;
    token: string;
  };
};

type MeResponse = {
  success: true;
  data: {
    user: User;
  };
};

type ChangePasswordResponse = {
  success: true;
  message: string;
};

type UsersResponse = {
  success: true;
  data: {
    users: User[];
    count: number;
  };
};

type UserResponse = {
  success: true;
  data: {
    user: User;
  };
};

type UpdateUserStatusResponse = {
  success: true;
  message: string;
  data: {
    user: Pick<User, "id" | "email" | "name" | "role" | "is_active">;
  };
};

type DeleteUserResponse = {
  success: true;
  message: string;
};

type PricingListResponse = {
  success: true;
  data: {
    pricing: Pricing[];
  };
};

type PricingResponse = {
  success: true;
  data: {
    pricing: Pricing;
  };
};

type UpdatePricingResponse = {
  success: true;
  message: string;
  data: {
    pricing: Pricing;
  };
};

export async function login(email: string, password: string): Promise<{ user: User; token: string }> {
  const response = await request<LoginResponse>("/api/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });

  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await request<MeResponse>("/api/auth/me");
  return response.data.user;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<string> {
  const response = await request<ChangePasswordResponse>("/api/auth/change-password", {
    method: "PUT",
    body: { currentPassword, newPassword },
  });

  return response.message;
}

export async function getUsers(): Promise<{ users: User[]; count: number }> {
  const response = await request<UsersResponse>("/api/admin/users");
  return response.data;
}

export async function getUserById(id: string): Promise<User> {
  const response = await request<UserResponse>(`/api/admin/users/${id}`);
  return response.data.user;
}

export async function updateUserStatus(id: string, is_active: boolean): Promise<UpdateUserStatusResponse["data"]["user"]> {
  const response = await request<UpdateUserStatusResponse>(`/api/admin/users/${id}/status`, {
    method: "PUT",
    body: { is_active },
  });

  return response.data.user;
}

export async function deleteUser(id: string): Promise<string> {
  const response = await request<DeleteUserResponse>(`/api/admin/users/${id}`, {
    method: "DELETE",
  });

  return response.message;
}

export async function getPricingList(): Promise<Pricing[]> {
  const response = await request<PricingListResponse>("/api/admin/pricing");
  return response.data.pricing;
}

export async function getPricingById(id: string): Promise<Pricing> {
  const response = await request<PricingResponse>(`/api/admin/pricing/${id}`);
  return response.data.pricing;
}

export async function updatePricing(
  id: string,
  payload: Partial<
    Pick<
      Pricing,
      | "base_fare"
      | "per_km_rate"
      | "vehicle_multiplier"
      | "surge_active"
      | "surge_multiplier"
      | "min_fare"
      | "max_fare"
    >
  >,
): Promise<Pricing> {
  const response = await request<UpdatePricingResponse>(`/api/admin/pricing/${id}`, {
    method: "PUT",
    body: payload,
  });

  return response.data.pricing;
}

export function formatApiError(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.errors.length > 0) {
      return error.errors.map((e) => `${e.field}: ${e.message}`).join(", ");
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
