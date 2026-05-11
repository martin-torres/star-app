import { createClient } from '@insforge/sdk';

export const insforge = createClient({
  baseUrl: import.meta.env.VITE_INSFORGE_URL || 'http://localhost:8090',
  anonKey: import.meta.env.VITE_INSFORGE_ANON_KEY || '',
});

export { createClient };
