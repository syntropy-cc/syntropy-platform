/**
 * Institutional landing — Labs pillar.
 * Explains what Labs is; CTA to access the Labs app.
 */

import Link from "next/link";
import { Card, Badge } from "@syntropy/ui";
import { Check } from "lucide-react";

const LABS_APP_URL =
  process.env.NEXT_PUBLIC_LABS_URL ?? "http://localhost:3003";

export default function LabsLandingPage() {
  return (
    <main className="min-h-screen">
      <section className="gradient-bg py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="labs" className="mb-4">
            LB
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Syntropy Labs
          </h1>
          <p className="mt-4 text-lg text-white/90">
            Ciência descentralizada. Laboratórios temáticos, colaboração global
            e gestão aberta para acelerar a ciência.
          </p>
        </div>
      </section>
      <section className="section-alt py-16">
        <div className="mx-auto max-w-4xl px-4">
          <Card variant="pillar" pillarHeader="labs" className="p-6">
            <h2 className="text-xl font-semibold">Recursos</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Labs temáticos: projetos e equipes interdisciplinares",
                "Gestão científica: Kanban, diários e versionamento",
                "Publicação aberta: peer review transparente",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={LABS_APP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors"
              >
                Acessar Labs
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
