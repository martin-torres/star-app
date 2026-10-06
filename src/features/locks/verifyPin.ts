/**
 * Server-side manager/kitchen PIN verification.
 *
 * The PIN is checked by the PocketBase hook route `/api/star/verify-pin`
 * (see db/pocketbase/pb_hooks/star_security.pb.js).
 *
 * Previously this was `newCode === expectedPin` in the browser, with the PIN
 * delivered to the client inside the public restaurant settings - so the "lock"
 * was cosmetic: the PIN could be read straight out of the settings response, and
 * nothing rate-limited guessing. Now the browser sends the candidate PIN to the
 * server, the server compares it against a salted hash it never exposes, and it
 * refuses after 5 failures per 10 minutes per IP per scope.
 */
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
}

const BASE = (import.meta.env.VITE_POCKETBASE_URL || '').replace(/\/+$/, '');

export async function verifyPin(
  restaurantId: string | undefined,
  scope: PinScope,
  pin: string,
): Promise<VerifyPinResult> {
  if (!restaurantId) {
    // Without a restaurant there is no PIN to check against. Fail closed.
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
      return { ok: true };
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
