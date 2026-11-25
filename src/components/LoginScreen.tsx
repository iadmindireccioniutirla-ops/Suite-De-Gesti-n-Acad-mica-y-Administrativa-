import { useState } from 'react';
import type { FormEvent } from 'react';
import { AlertCircle, LoaderCircle, LockKeyhole, Mail } from 'lucide-react';
import { InstitutionalLogo } from './InstitutionalMedia';

const INSTITUTIONAL_EMAIL = 'iadmindireccioniutirla@gmail.com';

interface LoginScreenProps {
  initialError?: string | null;
  onAuthenticated: (email: string, expiresAt: number) => void;
}

interface LoginResponse {
  authenticated?: boolean;
  email?: string;
  expiresAt?: number;
  error?: string;
}

export function LoginScreen({ initialError, onAuthenticated }: LoginScreenProps) {
  const [email, setEmail] = useState(INSTITUTIONAL_EMAIL);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({ email, password }),
      });
      const data = (await response.json()) as LoginResponse;

      if (!response.ok || !data.authenticated || !data.email || !data.expiresAt) {
        setError(data.error || 'No se pudo iniciar sesión. Intente nuevamente.');
        return;
      }

      setPassword('');
      onAuthenticated(data.email, data.expiresAt);
    } catch {
      setError('No se pudo conectar con el servidor. Verifique la conexión e intente nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5">
        <div className="bg-[#8B0000] px-8 py-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white p-2">
            <InstitutionalLogo className="h-12 w-12" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">
            IUTIRLA · Extensión Puerto Ordaz
          </p>
          <h1 className="mt-2 text-2xl font-bold">Acceso institucional</h1>
          <p className="mt-2 text-sm text-white/80">Suite de Gestión Académica y Administrativa</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-7 sm:px-8">
          <div>
            <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-slate-700">
              Correo institucional
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="login-email"
                type="email"
                autoComplete="username"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/15"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-lg border border-slate-300 py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-[#8B0000] focus:ring-2 focus:ring-[#8B0000]/15"
              />
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm leading-relaxed text-red-800"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !email.trim() || !password}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#8B0000] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6E0000] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Verificando acceso...
              </>
            ) : (
              'Iniciar sesión'
            )}
          </button>
          <p className="text-center text-xs text-slate-500">
            La sesión se cerrará automáticamente después de 12 horas.
          </p>
        </form>
      </section>
    </main>
  );
}
