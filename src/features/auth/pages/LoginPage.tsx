import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAxiosError } from 'axios';
import { Logo, LogoMark } from '../../../shared/brand/Logo';
import { apiClient } from '../../../shared/api/client';
import { setToken } from '../../../shared/api/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const { data } = await apiClient.post<{ accessToken: string }>('/auth/login', {
        email,
        senha: password,
        tipo: 'administrador',
      });
      setToken(data.accessToken);
      navigate('/');
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError('E-mail ou senha incorretos.');
      } else {
        setError('Não foi possível entrar. Verifique se o backend está rodando.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full font-sans">
      <div className="relative hidden flex-[40] flex-col overflow-hidden bg-gradient-to-br from-brand via-[#003266] to-brand-light p-12 text-white lg:flex lg:p-16">
        <LogoMark
          size={520}
          className="pointer-events-none absolute -bottom-24 -right-24 text-white opacity-[0.15]"
        />
        <Logo size={34} dark />

        <div className="flex-1" />

        <div className="relative z-10 max-w-xl">
          <div className="text-5xl font-extrabold leading-[1.05] tracking-tight xl:text-6xl">
            Painel
            <br />
            Lactare<span className="text-brand-light">.</span>
          </div>
          <p className="mt-5 max-w-md text-base leading-relaxed opacity-90 xl:text-lg">
            Espaço exclusivo para coordenadores e equipes Lactare acompanharem
            o impacto das nossas doadoras em tempo real.
          </p>
          <div className="mt-8 flex max-w-md items-start gap-3 rounded-2xl bg-white/10 p-5 text-sm leading-relaxed">
            <span className="text-lg">♡</span>
            <span>
              <b>+18%</b> de doadoras ativas em maio. <br />
              Cada gota chegando mais longe.
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-[60] items-center justify-center bg-bg p-8 sm:p-16">
        <form onSubmit={handleSubmit} className="w-full max-w-xl">
          <div className="mb-6 flex justify-center lg:hidden">
            <Logo size={34} />
          </div>

          <div className="mb-3 text-xs font-bold uppercase tracking-[0.6px] text-brand">
            Acesso administrativo
          </div>
          <h1 className="mb-3 text-3xl font-extrabold leading-tight text-ink">
            Que bom te ver de novo.
          </h1>
          <p className="mb-8 text-base text-muted">
            Faça login para acompanhar o impacto das nutrizes Lactare.
          </p>

          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-muted">E-mail corporativo</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-[1.5px] border-line px-4 text-base text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand-tint"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold text-muted">Senha</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-[1.5px] border-line px-4 text-base text-ink outline-none focus:border-brand focus:ring-4 focus:ring-brand-tint"
              />
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted">
              <input type="checkbox" defaultChecked className="h-4 w-4 accent-brand" />
              Manter conectado
            </label>
            <a className="text-sm font-semibold text-brand">Esqueci minha senha</a>
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-error/10 px-4 py-2.5 text-sm font-medium text-error">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-6 h-12 w-full rounded-xl bg-brand text-base font-bold text-white transition hover:bg-[#003a75] disabled:opacity-60"
          >
            {isSubmitting ? 'Entrando…' : 'Entrar no painel'}
          </button>

          <div className="mt-6 flex items-start gap-3 rounded-xl border border-dashed border-line bg-white p-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mt-0.5 shrink-0 text-muted"
            >
              <rect x="4" y="9" width="12" height="8" rx="1.5" />
              <path d="M7 9V6a3 3 0 0 1 6 0v3" />
            </svg>
            <p className="text-sm leading-relaxed text-muted">
              Acesso exclusivo a coordenadores e equipe Lactare. Solicitações
              via <b className="text-ink">admin@lactare.org</b>.
            </p>
          </div>

          <p className="mt-7 text-center text-xs text-faint">
            © Lactare 2026 · Conforme a LGPD · Termos · Privacidade
          </p>
        </form>
      </div>
    </div>
  );
}
