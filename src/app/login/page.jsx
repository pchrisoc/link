import { redirect } from 'next/navigation';
import { getSession } from '../../lib/auth';
import LoginForm from '../../components/LoginForm';

export const metadata = { title: 'Sign in · pchrisoc.com', robots: { index: false, follow: false } };
export default async function LoginPage() {
  if (await getSession()) redirect('/');
  return <LoginForm />;
}
