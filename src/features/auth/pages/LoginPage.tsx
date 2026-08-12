import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    navigate('/');
  }

  return (
    <div className="flex h-screen w-full font-sans">
      <div className="relative hidden flex-[1.05] flex-col overflow-hidden bg-gradient-to-br from-brand via-[#003266] to-brand-light p-14 text-white lg:flex">
        <span className="font-sans text-2xl font-extrabold">
          Lactare<span className="text-brand-light">.</span>
        </span>
        <div className="flex-1" />
        <div className="relative z-10">
          <div className="text-[38px] font-extrabold leading-tight tracking-tight">
            Painel
            <br />
            Lactare<span className="text-brand-light">.</span>
          </div>
          <p className="mt-4 max-w-[380px] text-sm leading-relaxed opacity-85">
            Espaço exclusivo para coordenadores e equipes Lactare acompanharem o
            impacto das nossas doadoras em tempo real.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-bg p-10">
        <form onSubmit={handleSubmit} className="w-full max-w-[380px]">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.6px] text-brand">
            Acesso administrativo
          </div>
          <h1 className="mb-2.5 text-[28px] font-extrabold text-ink">
            Que bom te ver de novo.
          </h1>
          <p className="mb-7 text-sm text-muted">
            Faça login para acompanhar o impacto das nutrizes Lactare.
          </p>

          <div className="flex flex-col gap-3.5">
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-muted">E-mail corporativo</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-[10px] border-[1.5px] border-line px-3.5 text-sm text-ink outline-none focus:border-brand focus:ring-[3px] focus:ring-brand-tint"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="text-[11px] font-semibold text-muted">Senha</span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 rounded-[10px] border-[1.5px] border-line px-3.5 text-sm text-ink outline-none focus:border-brand focus:ring-[3px] focus:ring-brand-tint"
              />
            </label>
          </div>

          <button
            type="submit"
            className="mt-6 h-12 w-full rounded-xl bg-brand text-sm font-bold text-white"
          >
            Entrar no painel
          </button>
        </form>
      </div>
    </div>
  );
}
