// ============================================================================
// @vectrabase/shared-types — API Response Wrappers & Error Codes
// Author: Karthik Kathari
// ============================================================================

import { z } from "zod";

// ---------------------------------------------------------------------------
// HTTP Status Codes Enum
// ---------------------------------------------------------------------------

export enum HttpStatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  MOVED_PERMANENTLY = 301,
  NOT_MODIFIED = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNPROCESSABLE_ENTITY = 422,
  TOO_MANY_REQUESTS = 429,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
}

// ---------------------------------------------------------------------------
// API Error Codes
// ---------------------------------------------------------------------------

export enum ApiErrorCode {
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  NOT_FOUND = "NOT_FOUND",
  RATE_LIMITED = "RATE_LIMITED",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  DUPLICATE_DOCUMENT = "DUPLICATE_DOCUMENT",
  GUARDRAIL_BLOCKED = "GUARDRAIL_BLOCKED",
  TOKEN_EXPIRED = "TOKEN_EXPIRED",
}

// ---------------------------------------------------------------------------
// Generic API Success Wrapper
// ---------------------------------------------------------------------------

export const ApiSuccessSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
    timestamp: z.string().datetime(),
  });

export type ApiSuccess<T> = {
  success: true;
  data: T;
  timestamp: string;
};

/** Helper to construct a typed success response object */
export const createApiSuccess = <T>(data: T): ApiSuccess<T> => ({
  success: true,
  data,
  timestamp: new Date().toISOString(),
});

// ---------------------------------------------------------------------------
// Generic API Error Wrapper
// ---------------------------------------------------------------------------

export const ApiErrorSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  code: z.nativeEnum(ApiErrorCode),
  statusCode: z.number().int(),
  timestamp: z.string().datetime(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;

/** Helper to construct a typed error response object */
export const createApiError = (
  error: string,
  code: ApiErrorCode,
  statusCode: HttpStatusCode,
): ApiError => ({
  success: false,
  error,
  code,
  statusCode,
  timestamp: new Date().toISOString(),
});

// ---------------------------------------------------------------------------
// Offset-Paginated Response
// ---------------------------------------------------------------------------

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    data: z.array(itemSchema),
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    hasMore: z.boolean(),
  });

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

/** Helper to construct a paginated response */
export const createPaginatedResponse = <T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResponse<T> => ({
  data,
  total,
  page,
  limit,
  hasMore: page * limit < total,
});

// ---------------------------------------------------------------------------
// Cursor-Paginated Response
// ---------------------------------------------------------------------------

export const CursorPaginatedResponseSchema = <T extends z.ZodTypeAny>(
  itemSchema: T,
) =>
  z.object({
    data: z.array(itemSchema),
    nextCursor: z.string().nullable(),
    prevCursor: z.string().nullable(),
    totalEstimate: z.number().int().nonnegative(),
    executionTimeMs: z.number().int().nonnegative(),
  });

export type CursorPaginatedResponse<T> = {
  data: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  totalEstimate: number;
  executionTimeMs: number;
};

/** Helper to construct a cursor-paginated response */
export const createCursorPaginatedResponse = <T>(
  data: T[],
  nextCursor: string | null,
  prevCursor: string | null,
  totalEstimate: number,
  executionTimeMs: number,
): CursorPaginatedResponse<T> => ({
  data,
  nextCursor,
  prevCursor,
  totalEstimate,
  executionTimeMs,
});
