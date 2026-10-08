/**
 * Server-side manager/kitchen PIN verification.
 *
 * The PIN is checked by the PocketBase hook route `/api/star/verify-pin`
 * (see db/pocketbase/pb_hooks/star_security.pb.js).
 *
 * On success the server returns a short-lived `session_token` used by
 * `/api/star/kitchen-orders` so the kitchen board can list/update orders
 * without a PocketBase user login.
 */
import { saveStaffSession, type StaffSession } from './staffSession';

export type PinScope = 'admin' | 'kitchen';

export type VerifyPinError =
  | 'invalid_pin'
  | 'too_many_attempts'
  | 'no_pin_configured'
  | 'network';

export interface VerifyPinResult {
  ok: boolean;
  error?: VerifyPinError;
  attemptsRemaining?: number;
  retryAfterSeconds?: number;
  session?: StaffSession;
}

const BASE = (import.meta.env.VITE_POCKETBASE_URL || '').replace(/\/+$/, '');

export async function verifyPin(
  restaurantId: string | undefined,
  scope: PinScope,
  pin: string,
): Promise<VerifyPinResult> {
  if (!restaurantId) {
    return { ok: false, error: 'no_pin_configured' };
  }
  if (!BASE) {
    return { ok: false, error: 'network' };
  }

  try {
    const res = await fetch(`${BASE}/api/star/verify-pin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ restaurant_id: restaurantId, scope, pin }),
    });

    const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;

    if (res.ok && data.ok === true) {
      const token = typeof data.session_token === 'string' ? data.session_token : '';
      const expiresIn =
        typeof data.expires_in_seconds === 'number' ? data.expires_in_seconds : 8 * 60 * 60;
      let session: StaffSession | undefined;
      if (token) {
        session = {
          token,
          scope,
          restaurantId,
          expiresAt: Date.now() + expiresIn * 1000,
        };
        saveStaffSession(session);
      }
      return { ok: true, session };
    }

    return {
      ok: false,
      error: (data.error as VerifyPinError) || 'invalid_pin',
      attemptsRemaining:
        typeof data.attempts_remaining === 'number' ? data.attempts_remaining : undefined,
      retryAfterSeconds:
        typeof data.retry_after_seconds === 'number' ? data.retry_after_seconds : undefined,
    };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export function pinErrorMessage(result: VerifyPinResult): string {
  switch (result.error) {
    case 'too_many_attempts': {
      const secs = result.retryAfterSeconds ?? 0;
      const mins = Math.max(1, Math.ceil(secs / 60));
      return `Demasiados intentos. Espera ${mins} min.`;
    }
    case 'no_pin_configured':
      return 'Sin PIN configurado para este acceso.';
    case 'network':
      return 'No se pudo verificar. Revisa tu conexión.';
    case 'invalid_pin':
    default: {
      const left = result.attemptsRemaining;
      return left && left > 0
        ? `PIN incorrecto. ${left} intento${left === 1 ? '' : 's'} restante${left === 1 ? '' : 's'}.`
        : 'PIN incorrecto.';
    }
  }
}
