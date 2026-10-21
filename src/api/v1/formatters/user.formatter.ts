import { Request } from "express";

export interface CreateUserInput {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  role?: string;
}

export function userDetailsFormatter(req: Request): CreateUserInput {
  const { fullName, email, phone, password, role } = req.body;
  return {
    fullName: typeof fullName === "string" ? fullName.trim() : "",
    email: typeof email === "string" ? email.toLowerCase().trim() : "",
    phone: typeof phone === "string" ? phone.trim() : "",
    password: password || "",
    role: role || "USER",
  };
}
