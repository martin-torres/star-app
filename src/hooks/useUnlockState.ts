import React from 'react';
import { insforge } from '../data/pocketbase/legacy-insforge';

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
    localStorage.setItem(DISCLAIMER_KEY, 'true');
    localStorage.setItem(DISCLAIMER_BY_KEY, customerName || 'anonymous');
    setDisclaimerAccepted(true);
    
    try {
      const { data } = await insforge.database
        .from('restaurant_settings')
        .select('*')
        .limit(1);
      if (data && data.length > 0) {
        await insforge.database
          .from('restaurant_settings')
          .update({
            disclaimer_accepted: true,
            disclaimer_accepted_by: customerName || 'anonymous',
            disclaimer_accepted_at: new Date().toISOString(),
          })
          .eq('id', data[0].id);
      }
    } catch (e) {
      console.log('Could not save disclaimer to database');
    }
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