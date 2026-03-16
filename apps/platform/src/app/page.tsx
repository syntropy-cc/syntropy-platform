"use client";

/**
 * Institutional landing — Hero, pillar sections, CTAs.
 * COMP-032, design system; reference: syntropy-cc/syntropy app/page.tsx
 */

import { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Card, Badge } from "@syntropy/ui";
import {
  BookOpen,
  Code,
  FlaskConical,
  Check,
  Briefcase,
  Heart,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";

const APP_URLS = {
  learn: process.env.NEXT_PUBLIC_LEARN_URL ?? "http://localhost:3001",
  hub: process.env.NEXT_PUBLIC_HUB_URL ?? "http://localhost:3002",
  labs: process.env.NEXT_PUBLIC_LABS_URL ?? "http://localhost:3003",
};

function AnimatedSection({
  id,
  children,
  className = "",
}: {
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

export default function InstitutionalHomePage() {
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0.3]);
  const { user } = useUser();

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <motion.section
        style={{ y: heroY, opacity: heroOpacity }}
        className="gradient-bg relative flex min-h-[70vh] flex-col items-center justify-center px-4 py-20 text-center"
      >
        <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
          Bem-vindo ao <span className="text-primary-foreground">Syntropy</span>
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-white/90">
          O ecossistema open source que une aprendizado prático, desenvolvimento
          colaborativo e pesquisa científica em uma plataforma integrada.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          {[
            {
              icon: BookOpen,
              title: "Aprenda",
              sectionId: "aprenda",
            },
            {
              icon: Code,
              title: "Desenvolva",
              sectionId: "desenvolva",
            },
            {
              icon: FlaskConical,
              title: "Pesquise",
              sectionId: "pesquise",
            },
          ].map(({ icon: Icon, title, sectionId }) => (
            <motion.button
              key={sectionId}
              type="button"
              onClick={() => scrollTo(sectionId)}
              className="flex flex-col items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-6 py-4 text-white transition-colors hover:bg-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="h-8 w-8" />
              <span className="font-medium">{title}</span>
            </motion.button>
          ))}
        </div>
      </motion.section>

      {/* Learn */}
      <AnimatedSection id="aprenda" className="section-alt py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Card variant="pillar" pillarHeader="learn" className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="learn" size="sm">
                LE
              </Badge>
              <h2 className="text-2xl font-semibold">Syntropy Learn</h2>
            </div>
            <p className="mt-2 text-muted-foreground">
              Desenvolva habilidades através de trilhas interativas e projetos
              práticos em um ambiente 100% online. Construa seu portfólio
              enquanto aprende.
            </p>
            <ul className="mt-4 space-y-2">
              {[
                "Trilhas baseadas em projetos",
                "Aprenda fazendo, sem instalações",
                "Portfólio integrado",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={APP_URLS.learn}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors"
              >
                Explorar cursos
              </a>
              <Link
                href="/learn"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium border border-border bg-background hover:bg-accent transition-colors"
              >
                Conhecer Syntropy Learn
              </Link>
            </div>
          </Card>
        </div>
      </AnimatedSection>

      {/* Hub / Projects */}
      <AnimatedSection id="desenvolva" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Card variant="pillar" pillarHeader="hub" className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="hub" size="sm">
                PJ
              </Badge>
              <h2 className="text-2xl font-semibold">Syntropy Projects</h2>
            </div>
            <p className="mt-2 text-muted-foreground">
              Colabore em projetos open source. Ambiente colaborativo completo,
              ferramentas integradas e financiamento transparente.
            </p>
            <ul className="mt-4 space-y-2">
              {[
                "Descoberta inteligente de projetos",
                "Ferramentas colaborativas integradas",
                "Sistema de financiamento transparente",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={APP_URLS.hub}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors"
              >
                Descobrir projetos
              </a>
              <Link
                href="/hub"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium border border-border bg-background hover:bg-accent transition-colors"
              >
                Conhecer Syntropy Projects
              </Link>
            </div>
          </Card>
        </div>
      </AnimatedSection>

      {/* Labs */}
      <AnimatedSection id="pesquise" className="section-alt py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Card variant="pillar" pillarHeader="labs" className="p-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="labs" size="sm">
                LB
              </Badge>
              <h2 className="text-2xl font-semibold">Syntropy Labs</h2>
            </div>
            <p className="mt-2 text-muted-foreground">
              Ciência aberta e colaborativa. Laboratórios temáticos, revisão por
              pares transparente e publicação científica aberta.
            </p>
            <ul className="mt-4 space-y-2">
              {[
                "Laboratórios descentralizados",
                "Revisão por pares transparente",
                "Publicação científica aberta",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={APP_URLS.labs}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors"
              >
                Explorar laboratórios
              </a>
              <Link
                href="/labs"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium border border-border bg-background hover:bg-accent transition-colors"
              >
                Conhecer Syntropy Labs
              </Link>
            </div>
          </Card>
        </div>
      </AnimatedSection>

      {/* Portfolio */}
      <AnimatedSection id="portfolio" className="py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Card variant="pillar" pillarHeader="portfolio" className="p-6">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Portfólio</h2>
            </div>
            <p className="mt-2 text-muted-foreground">
              Seu currículo vivo no ecossistema. Cursos, projetos e pesquisas se
              integram automaticamente ao seu portfólio dinâmico.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors"
              >
                Começar meu portfólio
              </Link>
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium border border-border bg-background hover:bg-accent transition-colors"
              >
                Conhecer Portfólio
              </Link>
            </div>
          </Card>
        </div>
      </AnimatedSection>

      {/* Contribute */}
      <AnimatedSection id="contribute" className="section-alt py-16">
        <div className="mx-auto max-w-6xl px-4">
          <Card variant="pillar" pillarHeader="contribute" className="p-6">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-semibold">Contribua</h2>
            </div>
            <p className="mt-2 text-muted-foreground">
              O Syntropy é feito por pessoas como você. Contribua com código,
              ideias ou documentação e faça parte da comunidade.
            </p>
            <div className="mt-6">
              <Link
                href="/contribute"
                className="inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors"
              >
                Quero contribuir
              </Link>
            </div>
          </Card>
        </div>
      </AnimatedSection>

      {/* CTA final — when auth enabled and not logged in */}
      {!user && (
        <AnimatedSection id="cta" className="py-16">
          <div className="mx-auto max-w-2xl px-4 text-center">
            <h2 className="text-2xl font-semibold">
              Pronto para fazer parte da revolução open-source?
            </h2>
            <p className="mt-2 text-muted-foreground">
              Faça parte do ecossistema que conecta aprendizado prático,
              desenvolvimento colaborativo e pesquisa científica descentralizada.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center justify-center rounded-md h-10 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-colors"
            >
              Começar minha jornada
            </Link>
          </div>
        </AnimatedSection>
      )}
    </main>
  );
}
