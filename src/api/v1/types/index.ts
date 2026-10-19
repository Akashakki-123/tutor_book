export interface JwtUserPayload {
  id: string;
  role?: string;
  email?: string;
  fullName?: string;
  [key: string]: unknown;
}

export interface ApiResponse<T = unknown> {
  status: boolean;
  subCode: number;
  message: string;
  error?: unknown;
  items?: T;
  tokenInfo?: unknown;
}

