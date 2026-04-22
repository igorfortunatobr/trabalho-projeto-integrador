"use client";

import { FormEvent, useEffect, useState } from "react";

type FormData = {
  name: string;
  email: string;
  password: string;
};

export default function Home() {
  const [status, setStatus] = useState<string>("Carregando...");
  const [healthError, setHealthError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
        const response = await fetch(`${apiUrl}/health`);

        if (!response.ok) {
          throw new Error("Backend indisponível no momento.");
        }

        const data = await response.json();
        setStatus(data.status);
      } catch (err) {
        setStatus("Indisponível");
        setHealthError(err instanceof Error ? err.message : String(err));
      }
    };

    fetchHealth();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
      const response = await fetch(`${apiUrl}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Nao foi possivel concluir o cadastro.");
      }

      setSuccessMessage(`Cadastro realizado com sucesso para ${data.name}.`);
      setFormData({
        name: "",
        email: "",
        password: "",
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(194,106,45,0.24),_transparent_35%),linear-gradient(180deg,_#f8f1e8_0%,_#efe5d8_100%)] px-6 py-10 text-stone-900">
      <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between rounded-[2rem] border border-[rgba(97,63,39,0.16)] bg-[rgba(255,250,243,0.86)] p-8 shadow-[0_20px_60px_rgba(73,43,23,0.12)] backdrop-blur md:p-10">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-[rgba(194,106,45,0.24)] bg-[rgba(194,106,45,0.12)] px-4 py-1 text-sm font-medium tracking-[0.18em] text-[#8a4316] uppercase">
                Plataforma do aluno
              </p>

              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-semibold leading-tight text-stone-900 md:text-6xl">
                  Cadastro simples para começar sua jornada na Autecno.
                </h1>
                <p className="max-w-xl text-base leading-7 text-stone-600 md:text-lg">
                  Preencha seus dados para acessar a plataforma, acompanhar aulas
                  teóricas e organizar seus próximos passos na habilitação.
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
                  <li>Aulas teoricas organizadas em um unico lugar.</li>
                  <li>Agendamento pratico com visao mais clara da rotina.</li>
                  <li>Treinamento para prova teorica direto na plataforma.</li>
                </ul>
              </article>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap gap-3 text-sm text-stone-500">
            <span className="rounded-full border border-[rgba(97,63,39,0.12)] px-3 py-2">
              Frontend em Next.js
            </span>
            <span className="rounded-full border border-[rgba(97,63,39,0.12)] px-3 py-2">
              Integrado ao endpoint POST /users
            </span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-[rgba(97,63,39,0.16)] bg-white/92 p-8 shadow-[0_20px_60px_rgba(73,43,23,0.12)] backdrop-blur md:p-10">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#8a4316]">
              Cadastro do aluno
            </p>
            <h2 className="text-3xl font-semibold text-stone-900">
              Crie sua conta
            </h2>
            <p className="text-sm leading-6 text-stone-600">
              Use seus dados para entrar na plataforma e acompanhar seu processo
              de habilitacao.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" htmlFor="name">
                Nome completo
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, name: event.target.value }))
                }
                className="w-full rounded-2xl border border-[rgba(97,63,39,0.18)] bg-[rgba(248,241,232,0.55)] px-4 py-3 outline-none transition focus:border-[#c26a2d] focus:ring-4 focus:ring-[rgba(194,106,45,0.12)]"
                placeholder="Digite seu nome"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" htmlFor="email">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(event) =>
                  setFormData((current) => ({ ...current, email: event.target.value }))
                }
                className="w-full rounded-2xl border border-[rgba(97,63,39,0.18)] bg-[rgba(248,241,232,0.55)] px-4 py-3 outline-none transition focus:border-[#c26a2d] focus:ring-4 focus:ring-[rgba(194,106,45,0.12)]"
                placeholder="voce@email.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-700" htmlFor="password">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(event) =>
                  setFormData((current) => ({
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

            {submitError && (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </p>
            )}

            {successMessage && (
              <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {successMessage}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}
