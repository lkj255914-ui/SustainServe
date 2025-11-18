// This is a mock authentication system.
// In a real application, you would use a proper authentication provider.
import { cookies } from 'next/headers';

export type User = {
  name: string;
  email: string;
  role: 'user' | 'admin';
};

const users: Omit<User, 'role'>[] = [
  { name: 'Admin User', email: 'jpratap731@gmail.com' },
  { name: 'Department User', email: 'user@example.com' },
];

export async function login(email: string) {
  const user = users.find((u) => u.email === email);
  if (user) {
    const role = user.email === 'jpratap731@gmail.com' ? 'admin' : 'user';
    const sessionData = JSON.stringify({ ...user, role });
    cookies().set('session', sessionData, { httpOnly: true, path: '/' });
    return { ...user, role };
  }
  return null;
}

export async function logout() {
  cookies().delete('session');
}

export async function getCurrentUser(): Promise<User | null> {
  const sessionCookie = cookies().get('session');
  if (sessionCookie) {
    try {
      const user = JSON.parse(sessionCookie.value) as User;
      // Re-validate user role
      user.role = user.email === 'jpratap731@gmail.com' ? 'admin' : 'user';
      return user;
    } catch (error) {
      return null;
    }
  }
  return null;
}
