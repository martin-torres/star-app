import React, { useCallback, useState } from 'react';
import { ChefHat, Lock } from 'lucide-react';
import { pinErrorMessage, type VerifyPinResult } from './verifyPin';

/**
 * PIN lock screens.
 *
 * Both screens previously compared the entered code against `expectedPin` in the
 * browser, with the PIN supplied to the client via public settings. Verification
 * now goes through the `verify` prop, which calls the server. The two screens
 * share one implementation so the auth logic exists in exactly one place.
 */
export interface LockProps {
  onUnlock: () => void;
  /** Must resolve to the server's verdict. Do not compare the PIN locally. */
  verify: (pin: string) => Promise<VerifyPinResult>;
  title?: string;
  accentColor?: string;
}

const KEYS: Array<number | 'C' | 'X'> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'X'];

const PinLockScreen = ({
  onUnlock,
  verify,
  title = 'Solo Dueño',
  accentColor = '#f59e0b',
  icon,
}: LockProps & { icon: React.ReactNode }) => {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [shake, setShake] = useState(false);

  const fail = useCallback((text: string) => {
    setMessage(text);
    setShake(true);
    setCode('');
    setTimeout(() => setShake(false), 350);
  }, []);

  const submit = useCallback(
    async (pin: string) => {
      setBusy(true);
      try {
        const result = await verify(pin);
        if (result.ok) {
          setMessage(null);
          setCode('');
          onUnlock();
        } else {
          fail(pinErrorMessage(result));
        }
      } finally {
        setBusy(false);
      }
    },
    [verify, onUnlock, fail],
  );

  const handleKey = useCallback(
    (k: number | 'C' | 'X') => {
      if (busy) return;
      if (k === 'C' || k === 'X') {
        setCode('');
        setMessage(null);
        return;
      }
      if (code.length >= 4) return;
      const next = code + String(k);
      setCode(next);
      if (next.length === 4) void submit(next);
    },
    [busy, code, submit],
  );

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-500">
      <div
        className={`w-full max-w-xs bg-white border-2 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] text-center ${
          shake ? 'animate-shake bg-red-50' : ''
        }`}
      >
        <div className="flex justify-center mb-4" style={{ color: accentColor }}>
          {icon}
        </div>
        <h3 className="text-xl font-black uppercase italic mb-6">{title}</h3>

        <div className="flex justify-center gap-4 mb-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 border-black transition-all ${
                code.length > i ? 'bg-black' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        <div className="h-8 mb-4 flex items-center justify-center px-1">
          {busy ? (
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Verificando…
            </span>
          ) : message ? (
            <span className="text-[11px] font-bold text-red-600 leading-tight">{message}</span>
          ) : null}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {KEYS.map((k) => (
            <button
              key={k}
              disabled={busy}
              onClick={() => handleKey(k)}
              className="aspect-square flex items-center justify-center bg-gray-100 rounded-2xl font-black text-xl active:scale-95 transition-all disabled:opacity-40"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = accentColor)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const DataLock = (props: LockProps) => (
  <PinLockScreen {...props} icon={<Lock className="w-12 h-12" />} />
);

export const KitchenLock = (props: LockProps) => (
  <PinLockScreen {...props} icon={<ChefHat className="w-12 h-12" />} />
);
