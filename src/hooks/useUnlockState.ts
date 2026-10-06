import React from 'react';

const UNLOCK_KEY = 'ldl_unlocked';
const DISCLAIMER_KEY = 'ldl_disclaimer_accepted';
const DISCLAIMER_BY_KEY = 'ldl_disclaimer_by';

export const useUnlockState = () => {
  const [isUnlocked, setIsUnlocked] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(UNLOCK_KEY) === 'true';
  });

  const [disclaimerAccepted, setDisclaimerAccepted] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(DISCLAIMER_KEY) === 'true';
  });

  const unlock = React.useCallback(() => {
    localStorage.setItem(UNLOCK_KEY, 'true');
    setIsUnlocked(true);
  }, []);

  const acceptDisclaimer = React.useCallback(async (customerName?: string) => {
    // Device-local only, deliberately.
    //
    // This used to also write `disclaimer_accepted*` onto `restaurant_settings`.
    // That collection is superuser-only and has no such columns, so the write
    // ALWAYS failed with 403 and was swallowed by the catch — a silent no-op that
    // looked like persistence. The acknowledgement is a per-device UX gate, so
    // localStorage is the correct store; if it ever needs to be recorded
    // server-side, it must go through a server route, not an anon collection write.
    localStorage.setItem(DISCLAIMER_KEY, 'true');
    localStorage.setItem(DISCLAIMER_BY_KEY, customerName || 'anonymous');
    setDisclaimerAccepted(true);
  }, []);

  const resetUnlock = React.useCallback(() => {
    localStorage.removeItem(UNLOCK_KEY);
    localStorage.removeItem(DISCLAIMER_KEY);
    localStorage.removeItem(DISCLAIMER_BY_KEY);
    setIsUnlocked(false);
    setDisclaimerAccepted(false);
  }, []);

  return {
    isUnlocked,
    disclaimerAccepted,
    unlock,
    acceptDisclaimer,
    resetUnlock,
  };
};