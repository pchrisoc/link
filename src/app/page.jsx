import Home from '../components/Home';

import { redirect } from 'next/navigation';
import { getSession } from '../lib/auth';

export default async function HomePage() {
  if (!await getSession()) redirect('/login');
  return (
    <main>
      <Home />
    </main>
  )
}
