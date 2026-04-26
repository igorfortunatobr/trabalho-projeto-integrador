"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getApiUrl } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";

type Profile = {
  id: number;
  name: string;
  email: string;
  role: "student" | "instructor";
};

type Instructor = {
  id: number;
  name: string;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      setIsLoading(false);
      setError("Sessão inválida. Faça login novamente.");
      return;
    }

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [profileResponse, instructorsResponse] = await Promise.all([
          fetch(`${getApiUrl()}/profile`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${getApiUrl()}/instructors`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        const profilePayload = await profileResponse.json();

        if (!profileResponse.ok) {
          throw new Error(profilePayload.message || "Não foi possível carregar seu perfil.");
        }

        setProfile(profilePayload);

        const instructorsPayload = await instructorsResponse.json();

        if (!instructorsResponse.ok) {
          throw new Error(
            instructorsPayload.message || "Não foi possível listar os instrutores.",
          );
        }

        setInstructors(instructorsPayload);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Falha ao carregar os dados do dashboard.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const isStudent = profile?.role === "student";

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-10 pt-28">
      <div className="grid gap-6">
        <Card className="space-y-4">
          <Badge>Área privada</Badge>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[var(--brand-blue)]">
              Dashboard inicial
            </h1>
            <p className="text-sm leading-6 text-slate-600">
              {profile
                ? `Olá, ${profile.name}. Este é o seu painel inicial na plataforma Autecno.`
                : "Carregando seu ambiente autenticado."}
            </p>
          </div>
        </Card>

        <Card className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <Badge>Instrutores disponíveis</Badge>
              <h2 className="text-2xl font-bold text-[var(--brand-blue)]">
                Escolha quem pode acompanhar suas aulas
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                A lista abaixo mostra os instrutores cadastrados e disponíveis na
                plataforma.
              </p>
            </div>

            {profile && (
              <span className="rounded-full border border-[var(--border-soft)] bg-slate-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                Perfil: {profile.role === "student" ? "Aluno" : "Instrutor"}
              </span>
            )}
          </div>

          {isLoading && (
            <p className="text-sm text-slate-500">Carregando instrutores disponíveis...</p>
          )}

          {error && (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          )}

          {!isLoading && !error && !isStudent && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Esta listagem foi preparada para a experiência do aluno no dashboard.
            </p>
          )}

          {!isLoading && !error && isStudent && instructors.length === 0 && (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
              Nenhum instrutor está disponível no momento.
            </p>
          )}

          {!isLoading && !error && isStudent && instructors.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {instructors.map((instructor) => (
                <article
                  key={instructor.id}
                  className="rounded-2xl border border-[var(--border-soft)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(244,248,255,0.96))] p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]"
                >
                  <Badge className="mb-4">Instrutor</Badge>
                  <h3 className="text-lg font-bold text-[var(--brand-blue)]">
                    {instructor.name}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Disponível para ser escolhido pelo aluno na plataforma.
                  </p>
                </article>
              ))}
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
