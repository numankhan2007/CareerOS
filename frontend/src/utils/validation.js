const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(value) {
  return value.trim().toLowerCase()
}

export function isValidEmail(value) {
  return EMAIL_PATTERN.test(value)
}

export function getPasswordStrengthChecks(password) {
  return {
    minLength: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
}

export function getPasswordStrengthError(password) {
  const checks = getPasswordStrengthChecks(password)
  if (!checks.minLength) return 'Password must be at least 8 characters.'
  if (!checks.uppercase) return 'Password must include at least one uppercase letter.'
  if (!checks.lowercase) return 'Password must include at least one lowercase letter.'
  if (!checks.number) return 'Password must include at least one number.'
  if (!checks.special) return 'Password must include at least one special character.'
  return ''
}

export function getSignupValidationError({ name, email, password }) {
  const normalizedName = name.trim()
  const normalizedEmail = normalizeEmail(email)

  if (normalizedName.length < 2) {
    return 'Name must be at least 2 characters.'
  }

  if (!isValidEmail(normalizedEmail)) {
    return 'Enter a valid email address.'
  }

  return getPasswordStrengthError(password)
}