// Lightweight validation helpers — avoids pulling in zod for the MVP.

export type ValidationResult = { ok: true; data: Record<string, unknown> } | { ok: false; errors: Record<string, string> }

interface Rule {
  field: string
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  isEmail?: boolean
  isOneOf?: readonly string[]
}

export function validate(
  body: Record<string, unknown>,
  rules: readonly Rule[],
): ValidationResult {
  const errors: Record<string, string> = {}
  const out: Record<string, unknown> = {}
  for (const rule of rules) {
    const field = rule.field
    const v = body[field]
    if (v === undefined || v === null || v === "") {
      if (rule.required) errors[field] = "required"
      out[field] = null
      continue
    }
    if (typeof v === "string") {
      const trimmed = v.trim()
      if (rule.minLength && trimmed.length < rule.minLength) {
        errors[field] = `min_length_${rule.minLength}`
        continue
      }
      if (rule.maxLength && trimmed.length > rule.maxLength) {
        errors[field] = `max_length_${rule.maxLength}`
        continue
      }
      if (rule.isEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        errors[field] = "invalid_email"
        continue
      }
      if (rule.isOneOf && !rule.isOneOf.includes(trimmed)) {
        errors[field] = "invalid_value"
        continue
      }
      out[field] = trimmed
      continue
    }
    if (typeof v === "number") {
      if (rule.min !== undefined && v < rule.min) {
        errors[field] = `min_${rule.min}`
        continue
      }
      if (rule.max !== undefined && v > rule.max) {
        errors[field] = `max_${rule.max}`
        continue
      }
      out[field] = v
      continue
    }
    if (typeof v === "boolean") {
      out[field] = v
      continue
    }
    out[field] = v
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors }
  return { ok: true, data: out }
}
