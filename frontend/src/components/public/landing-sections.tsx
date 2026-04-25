import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const features = [
  {
    title: "Agendamento de aulas",
    description:
      "Escolha data e horário com praticidade para manter a rotina de evolução.",
  },
  {
    title: "Busca de instrutores",
    description:
      "Encontre instrutores de forma organizada, com foco no perfil ideal para você.",
  },
  {
    title: "Treinamento teórico",
    description:
      "Acesse conteúdos essenciais para reforçar os estudos antes das aulas práticas.",
  },
  {
    title: "Notificações",
    description:
      "Receba lembretes e confirmações para não perder compromissos importantes.",
  },
];

const steps = [
  "Cadastro",
  "Login",
  "Escolher instrutor",
  "Agendar aula",
];

const benefits = [
  "Organização da rotina de aprendizado",
  "Facilidade para conectar aluno e instrutor",
  "Economia de tempo no processo de habilitação",
  "Aprendizado mais eficiente com teoria e prática integradas",
];

export function LandingSections() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-16">
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--brand-blue)]">Problema</h2>
          <p className="text-sm leading-7 text-slate-600">
            Muitos alunos estudam teoria em uma plataforma, buscam instrutores em outra
            e organizam aulas por mensagens dispersas, o que gera atrasos e confusão.
          </p>
        </Card>
        <Card className="space-y-4">
          <h2 className="text-2xl font-bold text-[var(--brand-blue)]">Solução</h2>
          <p className="text-sm leading-7 text-slate-600">
            A Autecno reúne teoria, prática e agendamento em um único sistema, com fluxo
            simples para facilitar decisões e acelerar a evolução do aluno.
          </p>
        </Card>
      </section>

      <section id="funcionalidades" className="space-y-5 scroll-mt-28">
        <h2 className="text-3xl font-bold text-[var(--brand-blue)]">Funcionalidades</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="space-y-2">
              <h3 className="text-lg font-semibold text-[var(--brand-blue)]">{feature.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section id="como-funciona" className="space-y-5 scroll-mt-28">
        <h2 className="text-3xl font-bold text-[var(--brand-blue)]">Como funciona</h2>
        <div className="grid gap-3 md:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={step} className="space-y-2 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                Passo {index + 1}
              </p>
              <p className="text-base font-semibold text-[var(--brand-blue)]">{step}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-3xl font-bold text-[var(--brand-blue)]">Benefícios</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {benefits.map((benefit) => (
            <Card key={benefit} className="p-5">
              <p className="text-sm font-medium text-slate-700">{benefit}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-[var(--border-soft)] bg-[var(--brand-blue)] p-8 text-white">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Comece agora sua jornada na Autecno</h2>
            <p className="text-sm text-slate-200">
              Crie sua conta, faça login e organize suas aulas em poucos passos.
            </p>
          </div>
          <Link href="/auth/cadastro">
            <Button className="min-w-40">Comece agora</Button>
          </Link>
        </div>
      </section>

      <footer id="contato" className="scroll-mt-28 rounded-2xl border border-[var(--border-soft)] bg-white p-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--brand-blue)]">Autecno</h3>
            <p className="mt-2 text-sm text-slate-600">Integração entre teoria e prática para alunos e instrutores.</p>
          </div>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="font-semibold text-[var(--brand-blue)]">Links úteis</p>
            <p>
              <Link href="/auth/login" className="underline">
                Login
              </Link>{" "}
              ·{" "}
              <Link href="/auth/cadastro" className="underline">
                Cadastro
              </Link>
            </p>
            <p>Contato: contato@autecno.com.br</p>
          </div>
        </div>
        <p className="mt-6 text-xs text-slate-500">
          © {new Date().getFullYear()} Autecno. Todos os direitos reservados.
        </p>
      </footer>
    </div>
  );
}
