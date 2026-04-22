"use client";

import { FormEvent, useEffect, useState } from "react";

type RegisterFormData = {
  name: string;
  email: string;
  password: string;
};

type LoginFormData = {
  email: string;
  password: string;
};

type Profile = {
  id: number;
  name: string;
  email: string;
};

type AuthMode = "register" | "login";

const TOKEN_STORAGE_KEY = "autecno.jwt";

function getApiUrl() {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
}

export default function Home() {
  const [status, setStatus] = useState<string>("Carregando...");
  const [healthError, setHealthError] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>("register");
  const [registerFormData, setRegisterFormData] = useState<RegisterFormData>({
    name: "",
    email: "",
    password: "",
  });
  const [loginFormData, setLoginFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const response = await fetch(`${getApiUrl()}/health`);

        if (!response.ok) {
          throw new Error("Backend indisponivel no momento.");
        }

        const data = await response.json();
        setStatus(data.status);
      } catch (err) {
        setStatus("Indisponivel");
        setHealthError(err instanceof Error ? err.message : String(err));
      }
    };

    fetchHealth();
  }, []);

  useEffect(() => {
    const storedToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);

    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  useEffect(() => {
    if (!token) {
      setProfile(null);
      setProfileError(null);
      return;
    }

    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      setProfileError(null);

      try {
        const response = await fetch(`${getApiUrl()}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Nao foi possivel carregar o perfil.");
        }

        setProfile(data);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Nao foi possivel carregar o perfil.";
        setProfile(null);
        setProfileError(message);
        window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleRegisterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${getApiUrl()}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel concluir o cadastro.");
      }

      setSuccessMessage(`Cadastro realizado com sucesso para ${data.name}.`);
      setRegisterFormData({
        name: "",
        email: "",
        password: "",
      });
      setLoginFormData({
        email: data.email,
        password: "",
      });
      setAuthMode("login");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const response = await fetch(`${getApiUrl()}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginFormData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel fazer login.");
      }

      window.localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setToken(data.token);
      setSuccessMessage("Login realizado com sucesso.");
      setLoginFormData((current) => ({
        ...current,
        password: "",
      }));
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setProfile(null);
    setProfileError(null);
    setSuccessMessage("Sessao encerrada com sucesso.");
    setAuthMode("login");
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(194,106,45,0.24),_transparent_35%),linear-gradient(180deg,_#f8f1e8_0%,_#efe5d8_100%)] px-6 py-10 text-stone-900">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between rounded-[2rem] border border-[rgba(97,63,39,0.16)] bg-[rgba(255,250,243,0.86)] p-8 shadow-[0_20px_60px_rgba(73,43,23,0.12)] backdrop-blur md:p-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-[rgba(194,106,45,0.24)] bg-[rgba(194,106,45,0.12)] px-4 py-1 text-sm font-medium uppercase tracking-[0.18em] text-[#8a4316]">
                Plataforma do aluno
              </p>

              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-stone-900 md:text-6xl">
                  Cadastro e login em um fluxo simples para entrar na Autecno.
                </h1>
                <p className="max-w-xl text-base leading-7 text-stone-600 md:text-lg">
                  Crie sua conta, autentique com JWT e acesse seu perfil sem sair
                  do mesmo ambiente que ja apresenta o cadastro.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-3xl border border-[rgba(97,63,39,0.12)] bg-white/80 p-5 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                  Status da API
                </h2>
                <div className="mt-4 flex items-center gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-semibold ${
                      status === "ok"
                        ? "bg-emerald-100 text-emerald-700"
                        : status === "Carregando..."
                          ? "bg-amber-100 text-amber-700"
                          : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {status.toUpperCase()}
                  </span>
                  <p className="text-sm text-stone-500">
                    Conexao com o backend em tempo real.
                  </p>
                </div>

                {healthError && (
                  <p className="mt-4 text-sm text-rose-600">{healthError}</p>
                )}
              </article>

              <article className="rounded-3xl border border-[rgba(97,63,39,0.12)] bg-[#1f2937] p-5 text-stone-100 shadow-sm">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-200/80">
                  O que voce encontra
                </h2>
                <ul className="mt-4 space-y-3 text-sm leading-6 text-stone-300">
                  <li>Cadastro de novos alunos com integracao ao backend.</li>
                  <li>Login com JWT para proteger o acesso ao perfil.</li>
                  <li>Consulta dos dados do usuario autenticado em tempo real.</li>
                </ul>
              </article>
            </div>

            <article className="rounded-3xl border border-[rgba(97,63,39,0.12)] bg-white/75 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Perfil protegido
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold text-stone-900">
                    Seu acesso autenticado aparece aqui
                  </h2>
                </div>

                {token && (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-2xl border border-[rgba(97,63,39,0.16)] px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-[#c26a2d] hover:text-[#8a4316]"
                  >
                    Sair
                  </button>
                )}
              </div>

              <div className="mt-6 rounded-3xl border border-dashed border-[rgba(97,63,39,0.18)] bg-[rgba(248,241,232,0.55)] p-5">
                {!token && (
                  <p className="text-sm leading-6 text-stone-600">
                    Faca login para consultar a rota protegida <code>/profile</code> e
                    visualizar os dados do usuario autenticado.
                  </p>
                )}

                {token && isLoadingProfile && (
                  <p className="text-sm text-stone-600">Carregando perfil...</p>
                )}

                {profileError && (
                  <p className="text-sm text-rose-600">{profileError}</p>
                )}

                {profile && (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
                      Autenticado
                    </p>
                    <div className="grid gap-3 md:grid-cols-3">
                      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
                          ID
                        </p>
                        <p className="mt-1 font-semibold text-stone-900">{profile.id}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
                          Nome
                        </p>
                        <p className="mt-1 font-semibold text-stone-900">{profile.name}</p>
                      </div>
                      <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                        <p className="text-xs uppercase tracking-[0.14em] text-stone-500">
                          E-mail
                        </p>
                        <p className="mt-1 font-semibold text-stone-900">
                          {profile.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-sm text-stone-500">
            <span className="rounded-full border border-[rgba(97,63,39,0.12)] px-3 py-2">
              Frontend em Next.js
            </span>
            <span className="rounded-full border border-[rgba(97,63,39,0.12)] px-3 py-2">
              Cadastro + login na mesma interface
            </span>
            <span className="rounded-full border border-[rgba(97,63,39,0.12)] px-3 py-2">
              Integrado aos endpoints /users, /auth/login e /profile
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[rgba(97,63,39,0.16)] bg-white/92 p-8 shadow-[0_20px_60px_rgba(73,43,23,0.12)] backdrop-blur md:p-10">
          <div className="space-y-4">
            <div className="flex rounded-full bg-[rgba(248,241,232,0.85)] p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("register");
                  setSubmitError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  authMode === "register"
                    ? "bg-[#c26a2d] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Criar conta
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setSubmitError(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  authMode === "login"
                    ? "bg-[#c26a2d] text-white shadow-sm"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                Entrar
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a4316]">
                {authMode === "register" ? "Cadastro do aluno" : "Login do aluno"}
              </p>
              <h2 className="text-3xl font-semibold text-stone-900">
                {authMode === "register" ? "Crie sua conta" : "Acesse sua conta"}
              </h2>
              <p className="text-sm leading-6 text-stone-600">
                {authMode === "register"
                  ? "Use seus dados para entrar na plataforma e acompanhar seu processo de habilitacao."
                  : "Entre com seu e-mail e senha para receber o JWT e consultar seu perfil protegido."}
              </p>
            </div>
          </div>

          {authMode === "register" ? (
            <form className="mt-8 space-y-5" onSubmit={handleRegisterSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700" htmlFor="name">
                  Nome completo
                </label>
                <input
                  id="name"
                  type="text"
                  value={registerFormData.name}
                  onChange={(event) =>
                    setRegisterFormData((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[rgba(97,63,39,0.18)] bg-[rgba(248,241,232,0.55)] px-4 py-3 outline-none transition focus:border-[#c26a2d] focus:ring-4 focus:ring-[rgba(194,106,45,0.12)]"
                  placeholder="Digite seu nome"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700" htmlFor="register-email">
                  E-mail
                </label>
                <input
                  id="register-email"
                  type="email"
                  value={registerFormData.email}
                  onChange={(event) =>
                    setRegisterFormData((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[rgba(97,63,39,0.18)] bg-[rgba(248,241,232,0.55)] px-4 py-3 outline-none transition focus:border-[#c26a2d] focus:ring-4 focus:ring-[rgba(194,106,45,0.12)]"
                  placeholder="voce@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700" htmlFor="register-password">
                  Senha
                </label>
                <input
                  id="register-password"
                  type="password"
                  value={registerFormData.password}
                  onChange={(event) =>
                    setRegisterFormData((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[rgba(97,63,39,0.18)] bg-[rgba(248,241,232,0.55)] px-4 py-3 outline-none transition focus:border-[#c26a2d] focus:ring-4 focus:ring-[rgba(194,106,45,0.12)]"
                  placeholder="Crie uma senha"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#c26a2d] px-4 py-3 font-semibold text-white transition hover:bg-[#8a4316] disabled:cursor-not-allowed disabled:bg-[#d5a47f]"
              >
                {isSubmitting ? "Cadastrando..." : "Cadastrar agora"}
              </button>
            </form>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleLoginSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700" htmlFor="login-email">
                  E-mail
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={loginFormData.email}
                  onChange={(event) =>
                    setLoginFormData((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[rgba(97,63,39,0.18)] bg-[rgba(248,241,232,0.55)] px-4 py-3 outline-none transition focus:border-[#c26a2d] focus:ring-4 focus:ring-[rgba(194,106,45,0.12)]"
                  placeholder="voce@email.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-700" htmlFor="login-password">
                  Senha
                </label>
                <input
                  id="login-password"
                  type="password"
                  value={loginFormData.password}
                  onChange={(event) =>
                    setLoginFormData((current) => ({
                      ...current,
                      password: event.target.value,
                    }))
                  }
                  className="w-full rounded-2xl border border-[rgba(97,63,39,0.18)] bg-[rgba(248,241,232,0.55)] px-4 py-3 outline-none transition focus:border-[#c26a2d] focus:ring-4 focus:ring-[rgba(194,106,45,0.12)]"
                  placeholder="Digite sua senha"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-2xl bg-[#c26a2d] px-4 py-3 font-semibold text-white transition hover:bg-[#8a4316] disabled:cursor-not-allowed disabled:bg-[#d5a47f]"
              >
                {isSubmitting ? "Entrando..." : "Entrar agora"}
              </button>
            </form>
          )}

          {submitError && (
            <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {submitError}
            </p>
          )}

          {successMessage && (
            <p className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
