/** Short-lived staff session issued by `/api/star/verify-pin`. */
const STORAGE_KEY = 'star_staff_session';

export interface StaffSession {
  token: string;
  scope: 'admin' | 'kitchen';
  restaurantId: string;
  expiresAt: number;
}

export function saveStaffSession(session: StaffSession): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* ignore quota / private mode */
  }
}

export function getStaffSession(): StaffSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StaffSession;
    if (!parsed?.token || !parsed.expiresAt || Date.now() > parsed.expiresAt) {
      clearStaffSession();
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearStaffSession(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function staffSessionHeaders(): Record<string, string> {
  const session = getStaffSession();
  return session ? { 'X-Star-Session': session.token } : {};
}
