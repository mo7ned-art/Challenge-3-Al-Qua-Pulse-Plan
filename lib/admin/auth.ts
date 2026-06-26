// Admin auth: simple PIN check via env.
// If no ADMIN_PIN is set, defaults to demo mode (any PIN or empty works).
// Set ADMIN_PIN to lock the admin down.

export function isAdminAuthorized(req: Request | null = null): boolean {
  const pin = process.env.ADMIN_PIN
  if (!pin) {
    // No PIN configured → open admin in demo mode
    return true
  }
  if (!req) return false
  const header = req.headers.get("x-admin-pin")
  if (header && header === pin) return true
  const cookie = parseCookie(req.headers.get("cookie") ?? "", "admin_pin")
  if (cookie && cookie === pin) return true
  return false
}

export function checkPin(submitted: string): boolean {
  const pin = process.env.ADMIN_PIN
  if (!pin) {
    return true
  }
  return submitted === pin
}

function parseCookie(cookieHeader: string, name: string): string | null {
  for (const part of cookieHeader.split(";")) {
    const [k, v] = part.trim().split("=")
    if (k === name) return decodeURIComponent(v ?? "")
  }
  return null
}

export function isDemoModeAllowed(): boolean {
  return !process.env.ADMIN_PIN
}
