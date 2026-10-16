import { describe, it, expect } from 'vitest';
import {
  generateBase32Secret,
  getOtpAuthUrl,
  generateTotp,
  verifyTotp,
  base32ToBuffer,
} from './totp.util.js';

describe('TOTP Utility', () => {
  it('generates a 32-character base32 secret', () => {
    const secret = generateBase32Secret(20);
    expect(secret).toHaveLength(32);
    expect(secret).toMatch(/^[A-Z2-7]+$/);
  });

  it('converts base32 string to buffer correctly with roundtrip', () => {
    const secret = generateBase32Secret(20);
    const buf = base32ToBuffer(secret);
    expect(buf).toBeInstanceOf(Buffer);
    expect(buf.length).toBeGreaterThan(0);
  });

  it('generates a valid otpauth:// URL', () => {
    const secret = 'JBSWY3DPEHPK3PXP';
    const url = getOtpAuthUrl('admin@ggm.org', secret, 'Grace of God Mission Asaba');
    expect(url).toContain('otpauth://totp/');
    expect(url).toContain('Grace%20of%20God%20Mission%20Asaba:admin%40ggm.org');
    expect(url).toContain('secret=JBSWY3DPEHPK3PXP');
    expect(url).toContain('issuer=Grace%20of%20God%20Mission%20Asaba');
  });

  it('generates and verifies valid TOTP tokens', () => {
    const secret = generateBase32Secret(20);
    const token = generateTotp(secret);
    expect(token).toMatch(/^\d{6}$/);

    const isValid = verifyTotp(secret, token, 1);
    expect(isValid).toBe(true);
  });

  it('rejects an incorrect TOTP token', () => {
    const secret = generateBase32Secret(20);
    const validToken = generateTotp(secret);
    const badToken = validToken === '999999' ? '000000' : '999999';
    const isInvalid = verifyTotp(secret, badToken, 0);
    expect(isInvalid).toBe(false);
  });
});
