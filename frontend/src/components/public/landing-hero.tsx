import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function LandingHero() {
  return (
    <section
      id="inicio"
      className="mx-auto grid min-h-[calc(100vh-7rem)] w-full max-w-6xl place-items-center px-4 pb-10 pt-28"
    >
      <div className="grid w-full gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-6 bg-[rgba(255,255,255,0.92)]">
          <Badge>Sistema web para habilitação</Badge>
          <div className="space-y-3">
            <h1 className="text-4xl font-bold leading-tight text-[var(--brand-blue)] md:text-5xl">
              Aprendizado teórico e prático no mesmo lugar.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-slate-600">
              A Autecno conecta alunos e instrutores com uma experiência moderna para
              cadastro, login, busca de instrutores, agendamento e acompanhamento da
              jornada de habilitação.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/auth/cadastro">
              <Button>Começar agora</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline">Fazer login</Button>
            </Link>
          </div>
        </Card>

        <Card className="space-y-4 bg-[var(--brand-blue)] text-white lg:pt-8">
          <h2 className="text-xl font-semibold text-white">Visão rápida da plataforma</h2>
          <ul className="space-y-2 text-sm leading-6 text-white">
            <li>Centraliza teoria, prática e comunicação em um fluxo único.</li>
            <li>Interface simples para reduzir fricção no dia a dia do aluno.</li>
            <li>Arquitetura pronta para crescer com notificações e novos módulos.</li>
          </ul>
        </Card>
      </div>
    </section>
  );
}
