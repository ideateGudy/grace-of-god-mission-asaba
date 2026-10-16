import * as crypto from 'node:crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function generateBase32Secret(byteLength = 20): string {
  const buffer = crypto.randomBytes(byteLength);
  let bits = 0;
  let value = 0;
  let output = '';

  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | buffer[i];
    bits += 8;

    while (bits >= 5) {
      output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }

  if (bits > 0) {
    output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
  }

  return output;
}

export function base32ToBuffer(base32: string): Buffer {
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (let i = 0; i < clean.length; i++) {
    const idx = BASE32_ALPHABET.indexOf(clean[i]);
    if (idx === -1) continue;

    value = (value << 5) | idx;
    bits += 5;

    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }

  return Buffer.from(bytes);
}

export function generateTotp(secret: string, timeStepWindow = 30, offsetSteps = 0): string {
  const key = base32ToBuffer(secret);
  const epoch = Math.floor(Date.now() / 1000);
  const timeStep = Math.floor(epoch / timeStepWindow) + offsetSteps;

  const timeBuffer = Buffer.alloc(8);
  timeBuffer.writeBigInt64BE(BigInt(timeStep));

  const hmac = crypto.createHmac('sha1', key);
  hmac.update(timeBuffer);
  const digest = hmac.digest();

  // Dynamic truncation
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, '0');
}

export function verifyTotp(secret: string, candidateCode: string, windowSteps = 1): boolean {
  if (!candidateCode || candidateCode.length !== 6) return false;

  for (let step = -windowSteps; step <= windowSteps; step++) {
    const expected = generateTotp(secret, 30, step);
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(candidateCode))) {
      return true;
    }
  }
  return false;
}

export function getOtpAuthUrl(email: string, secret: string, issuer = 'Grace of God Mission Asaba'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(email)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
