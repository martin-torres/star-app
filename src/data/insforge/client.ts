import { createClient } from '@insforge/sdk';

export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL || 'https://2y542jyv.us-east.insforge.app',
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || '',
});

export { createClient };
