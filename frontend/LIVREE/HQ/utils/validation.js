export const PHONE_PREFIX = '+221';
export const PHONE_DIGITS = 9;

export function validatePhone(phone) {
  return /^\d{9}$/.test(phone);
}

export function formatPhone(phone) {
  return `${PHONE_PREFIX}${phone}`;
}

export function validateEntryCode(entryCode) {
  return /^\d{4}$/.test(entryCode);
}

export function validateOTP(phone, otpCode) {
  if (!/^\d{4}$/.test(otpCode)) {
    return { valid: false, error: 'INVALID_FORMAT' };
  }

  const phonePrefix = phone.substring(0, 4);

  if (otpCode.startsWith(phonePrefix)) {
    return { valid: false, error: 'OTP_MATCHES_PHONE_PREFIX' };
  }

  return { valid: true };
}
