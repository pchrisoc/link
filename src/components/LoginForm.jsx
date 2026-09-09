'use client';

import { useState } from 'react';
import { Button, Paper, PasswordInput, Stack, Text, TextInput, Title } from '@mantine/core';
import classes from './LoginForm.module.css';

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
    <main className={classes.page}>
      <Paper p="xl" radius="md" className={classes.card}>
        <form onSubmit={submit}>
          <Stack>
            <Title order={1} size="h2">Sign in to pchrisoc.com</Title>
            <Text size="sm" c="#aaa">Manage your links. Shared short links are public.</Text>
            <TextInput name="email" label="Email" type="email" autoComplete="username" required maxLength={254} classNames={{ input: classes.input, label: classes.label }} />
            <PasswordInput name="password" label="Password" autoComplete="current-password" required maxLength={1024} classNames={{ input: classes.input, innerInput: classes.password, label: classes.label, visibilityToggle: classes.visibilityToggle }} />
            {error && <Text c="red" role="alert">{error}</Text>}
            <Button type="submit" loading={loading} className={classes.submit}>Sign in</Button>
          </Stack>
        </form>
      </Paper>
    </main>
  );
}
