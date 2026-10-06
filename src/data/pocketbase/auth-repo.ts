/**
 * Auth repository for managers/staff, backed by the PocketBase `users` auth
 * collection. PocketBase persists the token in `pb.authStore` (localStorage).
 */
import type { RecordModel } from 'pocketbase';
import { pb } from './client';
import { COLLECTIONS } from './collections';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

const toAuthUser = (record: RecordModel | null): AuthUser | null => {
  if (!record) return null;
  return {
    id: record.id,
    email: typeof record.email === 'string' ? record.email : '',
    name: typeof record.name === 'string' ? record.name : undefined,
  };
};

export class PocketBaseAuthRepository {
  async login(email: string, password: string): Promise<AuthUser> {
    const auth = await pb
      .collection(COLLECTIONS.users)
      .authWithPassword<RecordModel>(email, password);
    return toAuthUser(auth.record) ?? { id: auth.record.id, email };
  }

  logout(): void {
    pb.authStore.clear();
  }

  getCurrentUser(): AuthUser | null {
    return pb.authStore.isValid ? toAuthUser(pb.authStore.record) : null;
  }

  isAuthenticated(): boolean {
    return pb.authStore.isValid;
  }
}
