'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

import { apiRequest } from '@/lib/api';

interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
  };
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError('');

    try {
      const data = await apiRequest<LoginResponse>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      localStorage.setItem(
        'accessToken',
        data.accessToken,
      );

      localStorage.setItem(
        'user',
        JSON.stringify(data.user),
      );

      router.push('/');
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : 'Login failed',
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f7fa',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'white',
          padding: '40px',
          borderRadius: '16px',
          boxShadow:
            '0 10px 30px rgba(0,0,0,0.08)',
        }}
      >
        <h1
          style={{
            fontSize: '28px',
            marginBottom: '8px',
          }}
        >
          AllianceOS
        </h1>

        <p
          style={{
            color: '#667085',
            marginBottom: '30px',
          }}
        >
          Sign in to your workspace
        </p>

        <form onSubmit={handleSubmit}>
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="admin@allianceos.local"
            required
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              marginBottom: '20px',
              border: '1px solid #d0d5dd',
              borderRadius: '8px',
              boxSizing: 'border-box',
            }}
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Password"
            required
            style={{
              width: '100%',
              padding: '12px',
              marginTop: '8px',
              marginBottom: '20px',
              border: '1px solid #d0d5dd',
              borderRadius: '8px',
              boxSizing: 'border-box',
            }}
          />

          {error && (
            <div
              style={{
                color: '#b42318',
                background: '#fef3f2',
                padding: '10px',
                borderRadius: '8px',
                marginBottom: '20px',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px',
              border: 'none',
              borderRadius: '8px',
              background: '#111827',
              color: 'white',
              fontWeight: 600,
              cursor: loading
                ? 'not-allowed'
                : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading
              ? 'Signing in...'
              : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  );
}
