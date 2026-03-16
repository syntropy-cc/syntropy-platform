/**
 * Institutional landing — Contribute.
 * Explains how to contribute; CTA to get involved.
 */

import Link from "next/link";
import { Card } from "@syntropy/ui";
import { Check } from "lucide-react";

export default function ContributeLandingPage() {
  return (
    <main className="min-h-screen">
      <section className="gradient-bg py-20 px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Contribua
          </h1>
          <p className="mt-4 text-lg text-white/90">
            O Syntropy é feito por pessoas como você. Código aberto, comunidade
            vibrante e espaço para todos crescerem juntos.
          </p>
        </div>
      </section>
      <section className="section-alt py-16">
        <div className="mx-auto max-w-4xl px-4">
          <Card variant="pillar" pillarHeader="contribute" className="p-6">
            <h2 className="text-xl font-semibold">Como contribuir</h2>
            <ul className="mt-4 space-y-2">
              {[
                "Sugerir melhorias e novas features",
                "Corrigir bugs e problemas",
                "Melhorar a documentação",
                "Participar das discussões",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors"
              >
                Quero contribuir
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
