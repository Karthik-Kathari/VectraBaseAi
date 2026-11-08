/**
 * VectraBase AI — Authentication & Security Unit Tests
 * Author: Karthik Kathari (github.com/Karthik-Kathari)
 */

import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

describe('Auth Utilities & Security Invariants', () => {
  const JWT_SECRET = 'test_jwt_secret_at_least_32_characters_long_for_hs256';

  function issueTestToken(payload: object, expiresIn = '15m') {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any, algorithm: 'HS256' });
  }

  function hashToken(raw: string): string {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  it('should sign and verify valid JWT tokens', () => {
    const payload = {
      sub: 'user-uuid-1234',
      tenantId: 'tenant-uuid-5678',
      role: 'WORKSPACE_OWNER',
    };

    const token = issueTestToken(payload);
    const decoded = jwt.verify(token, JWT_SECRET) as typeof payload & { iat: number; exp: number };

    expect(decoded.sub).toBe(payload.sub);
    expect(decoded.tenantId).toBe(payload.tenantId);
    expect(decoded.role).toBe(payload.role);
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  it('should reject expired tokens during verification', () => {
    const token = issueTestToken({ sub: 'user-uuid-1234' }, '-1s');
    expect(() => jwt.verify(token, JWT_SECRET)).toThrow();
  });

  it('should compute deterministic SHA-256 token hashes for refresh rotation', () => {
    const raw = 'raw_refresh_token_string_example';
    const hash1 = hashToken(raw);
    const hash2 = hashToken(raw);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
  });
});

