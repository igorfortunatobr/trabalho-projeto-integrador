import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function DashboardPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 pb-10 pt-28">
      <Card className="space-y-4">
        <Badge>Área privada</Badge>
        <h1 className="text-3xl font-bold text-[var(--brand-blue)]">Dashboard inicial</h1>
        <p className="text-sm leading-6 text-slate-600">
          Esta área está preparada para receber os módulos do sistema. Por enquanto,
          ela funciona como página inicial autenticada.
        </p>
      </Card>
    </main>
  );
}
