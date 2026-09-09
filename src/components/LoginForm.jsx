'use client';

import { useState } from 'react';
import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fields.get('email'), password: fields.get('password') }),
      });
      if (!response.ok) { setError((await response.json()).message); return; }
      window.location.replace('/');
    } catch { setError('Unable to sign in. Please try again.'); }
    finally { setLoading(false); }
  }
  return (
    <main style={{ minHeight: '100vh', background: '#121212', display: 'grid', placeItems: 'center', padding: '1rem' }}>
      <Paper p="xl" radius="md" style={{ width: '100%', maxWidth: 400 }}>
        <form onSubmit={submit}>
          <Stack>
            <Title order={1} size="h2">Sign in to pchrisoc.com</Title>
            <Text size="sm" c="dimmed">Manage your links. Shared short links are public.</Text>
            <TextInput name="email" label="Email" type="email" autoComplete="username" required maxLength={254} />
            <PasswordInput name="password" label="Password" autoComplete="current-password" required maxLength={1024} />
            {error && <Text c="red" role="alert">{error}</Text>}
            <Button type="submit" loading={loading}>Sign in</Button>
          </Stack>
        </form>
      </Paper>
    </main>
  );
}
