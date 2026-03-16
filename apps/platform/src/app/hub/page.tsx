/**
 * Institutional landing — Hub / Projects pillar.
 * Explains what Hub/Projects is; CTA to access the Hub app.
 */

import Link from "next/link";
import { Card, Badge } from "@syntropy/ui";
import { Check } from "lucide-react";

const HUB_APP_URL =
  process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3002";

export default function HubLandingPage() {
  return (
    <main className="min-h-screen">
      <section className="gradient-bg py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="hub" className="mb-4">
            PJ
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Syntropy Projects
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Desenvolva, colabore e financie projetos open source com suporte
            completo e matchmaking inteligente.
          </p>
        </div>
      </section>
      <section className="section-alt py-16">
        <div className="mx-auto max-w-4xl px-4">
          <Card variant="pillar" pillarHeader="hub" className="p-6">
            <h2 className="text-xl font-semibold">O que você encontra</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Ambiente completo: dev em nuvem, versionamento e deploy",
                "Matchmaking de projetos: descubra onde contribuir",
                "Financiamento transparente: capte recursos e acompanhe impacto",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={HUB_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors"
              >
                Acessar Hub
              </a>
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
