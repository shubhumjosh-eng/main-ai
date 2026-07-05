const PREMIUM_KEY = 'gv-premium'

export function isPremium(): boolean {
  try {
    return localStorage.getItem(PREMIUM_KEY) === 'true'
  } catch {
    return false
  }
}

export function enablePremium(): void {
  try {
    localStorage.setItem(PREMIUM_KEY, 'true')
  } catch {}
}

export function disablePremium(): void {
  try {
    localStorage.removeItem(PREMIUM_KEY)
  } catch {}
}
