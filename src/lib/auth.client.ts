'use client';

import { login as serverLogin, logout as serverLogout } from './auth';
export type { User } from './types';

export async function login(email: string) {
    return await serverLogin(email);
}

export async function logout() {
    return await serverLogout();
}
