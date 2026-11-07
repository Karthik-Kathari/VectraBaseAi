// ============================================================================
// @vectrabase/shared-types — Auth Schemas & Types
// Author: Karthik Kathari
// ============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const UserRoleSchema = z.enum([
  "WORKSPACE_OWNER",
  "AI_ENGINEER",
  "VIEWER_ANALYST",
]);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const TenantPlanSchema = z.enum(["FREE", "PRO", "ENTERPRISE"]);
export type TenantPlan = z.infer<typeof TenantPlanSchema>;

// ---------------------------------------------------------------------------
// JWT Payload
// ---------------------------------------------------------------------------

export const JWTPayloadSchema = z.object({
  userId: z.string().uuid(),
  tenantId: z.string().uuid(),
  role: UserRoleSchema,
  email: z.string().email(),
  exp: z.number().int().positive(),
  iat: z.number().int().positive(),
});
export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

export const UserSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  email: z.string().email(),
  displayName: z.string().min(1).max(128),
  role: UserRoleSchema,
  avatarUrl: z.string().url().nullable(),
  isActive: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type User = z.infer<typeof UserSchema>;

// ---------------------------------------------------------------------------
// Auth Requests & Responses
// ---------------------------------------------------------------------------

export const LoginRequestSchema = z.object({
  email: z.string().email({ message: "A valid email address is required." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(256),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

export const LoginResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().int().positive(), // seconds
  user: UserSchema,
});
export type LoginResponse = z.infer<typeof LoginResponseSchema>;

export const RegisterRequestSchema = z
  .object({
    email: z.string().email({ message: "A valid email address is required." }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters." })
      .max(256),
    confirmPassword: z.string(),
    displayName: z
      .string()
      .min(1, { message: "Display name is required." })
      .max(128),
    workspaceName: z
      .string()
      .min(2, { message: "Workspace name must be at least 2 characters." })
      .max(128),
    plan: TenantPlanSchema.optional().default("FREE"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const RefreshTokenRequestSchema = z.object({
  // The refresh token is transmitted via HTTP-Only cookie by default.
  // This body field is optional for clients that prefer bearer-token rotation.
  refreshToken: z.string().optional(),
});
export type RefreshTokenRequest = z.infer<typeof RefreshTokenRequestSchema>;

export const RefreshTokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  expiresIn: z.number().int().positive(),
});
export type RefreshTokenResponse = z.infer<typeof RefreshTokenResponseSchema>;
