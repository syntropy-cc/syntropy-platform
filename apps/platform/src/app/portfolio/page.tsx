/**
 * Institutional landing — Portfolio.
 * Explains the portfolio; CTA to get started.
 */

import Link from "next/link";
import { Card } from "@syntropy/ui";
import { Check } from "lucide-react";

export default function PortfolioLandingPage() {
  return (
    <main className="min-h-screen">
      <section className="gradient-bg py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Portfólio Syntropy
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Seu currículo vivo no ecossistema. Cursos, projetos e pesquisas se
            integram automaticamente ao seu portfólio dinâmico.
          </p>
        </div>
      </section>
      <section className="section-alt py-16">
        <div className="mx-auto max-w-4xl px-4">
          <Card variant="pillar" pillarHeader="portfolio" className="p-6">
            <h2 className="text-xl font-semibold">O que compõe seu portfólio</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Cursos e certificações verificáveis",
                "Projetos com métricas de impacto",
                "Contribuições científicas documentadas",
                "Histórico completo de colaborações",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors"
              >
                Começar meu portfólio
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium border border-border bg-background hover:bg-accent transition-colors"
              >
                Voltar ao início
              </Link>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
