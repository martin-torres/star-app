import { useState, useEffect } from 'react';

type ViewMode = 'customer' | 'admin' | 'data';

export const useUrlMode = (): ViewMode => {
  const [mode, setMode] = useState<ViewMode>('customer');

  useEffect(() => {
    // Parse URL on mount only
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');

    // Validate mode parameter
    if (modeParam === 'admin' || modeParam === 'data') {
      setMode(modeParam);
    }
    // If invalid or missing, stays 'customer' (default)
  }, []); // Empty dependency array = run once on mount

  return mode;
};

/**
 * Extract restaurant_id from URL query params.
 */
export const useRestaurantId = (): string | null => {
  const [restaurantId, setRestaurantId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setRestaurantId(params.get('restaurant_id'));
  }, []);

  return restaurantId;
};
