"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { motion, useScroll, useTransform, useInView } from "framer-motion"
import { Button } from "../components/ui/button"
import { BookOpen, Users, FlaskConical, Check, Award, Briefcase, GraduationCap, Lightbulb, FileText, MessageCircle } from "lucide-react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@syntropy/ui"
import { useAuth } from "@/hooks/use-auth"
import { isAuthEnabled } from "@/lib/feature-flags"

const MOTION_DURATION = 0.3

function PortfolioCard() {
  return (
    <Link
      href="/portfolio"
      aria-label="Ir para Portfólio"
      className="block max-w-[400px] w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
    >
      <Card variant="pillar" pillarHeader="portfolio" className="h-full transition-transform duration-200 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Briefcase className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </div>
          <div>
            <CardTitle className="text-foreground text-xl">Seu Portfólio</CardTitle>
            <CardDescription>Registro dinâmico</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Seu portfólio dinâmico: conquistas, projetos e pesquisas integrados
            automaticamente para comprovar suas habilidades com evidências reais
            no ecossistema Syntropy.
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-3">
              <Award className="h-6 w-6 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-medium text-foreground">Cursos & Certificações</p>
                <p className="text-sm text-muted-foreground">8 cursos, 3 certificados</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-3">
              <Briefcase className="h-6 w-6 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-medium text-foreground">Projetos Concluídos</p>
                <p className="text-sm text-muted-foreground">5 projetos, 12 colaborações</p>
              </div>
            </div>
            <div className="flex items-center gap-4 rounded-lg border border-border bg-muted/30 p-3">
              <GraduationCap className="h-6 w-6 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-medium text-foreground">Atividades Científicas</p>
                <p className="text-sm text-muted-foreground">2 artigos, 1 laboratório</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 border-t border-border pt-4 text-center">
            <div>
              <p className="font-medium text-foreground">15</p>
              <p className="text-xs text-muted-foreground">Conquistas</p>
            </div>
            <div>
              <p className="font-medium text-foreground">120</p>
              <p className="text-xs text-muted-foreground">Contribuições</p>
            </div>
            <div>
              <p className="font-medium text-foreground">7</p>
              <p className="text-xs text-muted-foreground">Certificados</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}


function SyntropyProjectsCard() {
  return (
    <Link
      href="/hub"
      aria-label="Ir para Syntropy Projects"
      className="block max-w-[400px] w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
    >
      <Card variant="pillar" pillarHeader="hub" className="h-full transition-transform duration-200 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Users className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </div>
          <div>
            <CardTitle className="text-foreground text-xl">Syntropy Projects</CardTitle>
            <CardDescription>Plataforma de Desenvolvimento</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Desenvolva, colabore e financie projetos open source com suporte
            completo e matchmaking inteligente.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary" aria-hidden>
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">Ambiente Completo</p>
                <p className="text-sm text-muted-foreground">Dev em nuvem, versionamento e deploy</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary" aria-hidden>
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">Matchmaking de Projetos</p>
                <p className="text-sm text-muted-foreground">Descubra projetos, faça a diferença</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary" aria-hidden>
                <Briefcase className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">Financiamento Transparente</p>
                <p className="text-sm text-muted-foreground">Capte recursos e acompanhe o impacto</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </Link>
  )
}

function SyntropyLearnCard() {
  return (
    <Link
      href="/learn"
      aria-label="Ir para Syntropy Learn"
      className="block max-w-[400px] w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
    >
      <Card variant="pillar" pillarHeader="learn" className="h-full transition-transform duration-200 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <BookOpen className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </div>
          <div>
            <CardTitle className="text-foreground text-xl">Syntropy Learn</CardTitle>
            <CardDescription>Plataforma de Aprendizado</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Plataforma de aprendizado prático, trilhas modulares e mentoria
            colaborativa para você evoluir construindo projetos reais.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary" aria-hidden>
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">Trilhas Interconectadas</p>
                <p className="text-sm text-muted-foreground">Progresso contínuo e modular</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary" aria-hidden>
                <Users className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">Mentoria & Comunidade</p>
                <p className="text-sm text-muted-foreground">Aprenda colaborando e ensinando</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary" aria-hidden>
                <GraduationCap className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">Formato Modular</p>
                <p className="text-sm text-muted-foreground">Cursos compactos, foco prático</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </Link>
  )
}


function SyntropyLabsCard() {
  return (
    <Link
      href="/labs"
      aria-label="Ir para Syntropy Labs"
      className="block max-w-[400px] w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
    >
      <Card variant="pillar" pillarHeader="labs" className="h-full transition-transform duration-200 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <FlaskConical className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </div>
          <div>
            <CardTitle className="text-foreground text-xl">Syntropy Labs</CardTitle>
            <CardDescription>Ciência Descentralizada</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Laboratórios temáticos, colaboração global e gestão aberta para
            acelerar a ciência.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary" aria-hidden>
                <FlaskConical className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">Labs Temáticos</p>
                <p className="text-sm text-muted-foreground">Projetos e equipes interdisciplinares</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary" aria-hidden>
                <Award className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">Gestão Científica</p>
                <p className="text-sm text-muted-foreground">Kanban, diários e versionamento</p>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary" aria-hidden>
                <BookOpen className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium text-foreground">Publicação Aberta</p>
                <p className="text-sm text-muted-foreground">Peer review transparente</p>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>
    </Link>
  )
}


function AnimatedSection({
  id,
  children,
  className = "",
}: {
  id: string
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [reduceMotion, setReduceMotion] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduceMotion(mq.matches)
    const fn = () => setReduceMotion(mq.matches)
    mq.addEventListener("change", fn)
    return () => mq.removeEventListener("change", fn)
  }, [])

  return (
    <motion.section
      id={id}
      ref={ref}
      className={`min-h-screen flex items-center py-20 px-4 ${className}`}
      initial={reduceMotion ? false : { opacity: 0, y: 60 }}
      animate={isInView ? (reduceMotion ? false : { opacity: 1, y: 0 }) : (reduceMotion ? false : { opacity: 0, y: 60 })}
      transition={{ duration: MOTION_DURATION, ease: "easeOut" }}
    >
      {children}
    </motion.section>
  )
}


function ContributeCard() {
  const items = [
    { icon: Lightbulb, text: "Sugerir melhorias e novas features" },
    { icon: Check, text: "Corrigir bugs e problemas" },
    { icon: FileText, text: "Melhorar a documentação" },
    { icon: MessageCircle, text: "Participar das discussões" },
  ]
  return (
    <Link
      href="/contribute"
      aria-label="Ir para página de contribuição"
      className="block max-w-[400px] w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl"
    >
      <Card variant="pillar" pillarHeader="contribute" className="h-full transition-transform duration-200 hover:-translate-y-0.5">
        <CardHeader className="flex flex-row items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Users className="h-6 w-6" strokeWidth={1.5} aria-hidden />
          </div>
          <div>
            <CardTitle className="text-foreground text-xl">Contribua</CardTitle>
            <CardDescription>Faça parte da comunidade</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Código aberto, comunidade vibrante e espaço para todos crescerem
            juntos. Compartilhe ideias, envie PRs e colabore para transformar o
            Syntropy!
          </p>
          <ul className="space-y-3">
            {items.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center text-primary" aria-hidden>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm text-foreground">{text}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function HomePage() {
  const { scrollYProgress } = useScroll()
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -100])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const { user } = useAuth()

  return (
    <div className="bg-background text-foreground overflow-hidden px-4">
      {/* Hero Section */}
      <motion.section
        className="relative min-h-screen flex items-center justify-center"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: MOTION_DURATION, ease: "easeOut" }}
          >
            <h1 className="text-4xl md:text-6xl font-medium mb-6 text-foreground">
              Bem-vindo ao{" "}
              <span className="text-primary">Syntropy</span>
            </h1>
          </motion.div>

          <motion.p
            className="text-lg md:text-xl text-muted-foreground mb-16 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: MOTION_DURATION }}
          >
            O ecossistema open source que une aprendizado prático, desenvolvimento colaborativo e pesquisa científica em uma plataforma integrada
          </motion.p>

          {/* Three Pillars */}
          <motion.div
            className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: MOTION_DURATION }}
          >
            {[
              { Icon: BookOpen, title: "Aprenda", sectionId: "aprenda" },
              { Icon: Users, title: "Desenvolva", sectionId: "desenvolva" },
              { Icon: FlaskConical, title: "Pesquise", sectionId: "pesquise" },
            ].map(({ Icon, title, sectionId }) => (
              <button
                key={title}
                type="button"
                onClick={() => {
                  const element = document.getElementById(sectionId)
                  if (element) element.scrollIntoView({ behavior: "smooth" })
                }}
                className="flex flex-col items-center gap-6 p-4 rounded-xl border border-transparent bg-transparent cursor-pointer font-medium text-foreground hover:bg-muted/50 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <span className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-primary" aria-hidden>
                  <Icon className="h-10 w-10" strokeWidth={1.5} />
                </span>
                <span className="text-xl">{title}</span>
              </button>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Learn Section */}
      <AnimatedSection id="aprenda">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="flex justify-center">
              <SyntropyLearnCard />
            </div>
            <div>
              <div className="hidden md:block">
                <h2 className="text-4xl md:text-5xl font-medium mb-6 text-foreground">Aprenda construindo projetos reais</h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Desenvolva habilidades através de trilhas interativas e projetos práticos em um ambiente de desenvolvimento 100% online. Construa seu portfólio enquanto aprende, publique projetos open source e conecte-se com uma comunidade colaborativa global.
                </p>
                <div className="space-y-4 mb-8">
                  {["Trilhas baseadas em projetos", "Aprenda fazendo, sem instalações", "Portifólio Integrado"].map((item, index) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="flex flex-nowrap gap-4">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                    <Link href="/learn/courses">Explorar cursos</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-border text-foreground hover:bg-muted px-8 py-4 text-lg"
                  >
                    <Link href="/learn">Conhecer Syntropy Learn</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Build Section */}
      <AnimatedSection id="desenvolva" className="bg-muted/30">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <div className="hidden md:block">
                <h2 className="text-4xl md:text-5xl font-medium mb-6 text-foreground">Colabore em projetos open source</h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Descubra projetos open source alinhados ao seu perfil e contribua com facilidade. Ambiente colaborativo completo, ferramentas integradas e sistema de financiamento transparente, tudo para transformar suas ideias em soluções reais que impactam a comunidade.
                </p>
                <div className="space-y-4 mb-8">
                  {["Descoberta inteligente de projetos", "Ferramentas colaborativas integradas", "Sistema de financiamento transparente"].map(
                    (item, index) => (
                      <motion.div
                        key={item}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                      >
                        <Check className="h-5 w-5 text-primary" />
                        <span className="text-muted-foreground">{item}</span>
                      </motion.div>
                    ),
                  )}
                </div>
                <div className="flex flex-nowrap gap-4">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                    <Link href="/hub">Descobrir projetos</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-border text-foreground hover:bg-muted px-8 py-4 text-lg"
                  >
                    <Link href="/hub">Conhecer Syntropy Projects</Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <SyntropyProjectsCard />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Research Section */}
      <AnimatedSection id="pesquise">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div className="flex justify-center">
              <SyntropyLabsCard />
            </div>
            <div>
              <div className="hidden md:block">
                <h2 className="text-4xl md:text-5xl font-medium mb-6 text-foreground">Ciência aberta e colaborativa</h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Revolucione a pesquisa científica. Participe de laboratórios temáticos descentralizados, colabore com pesquisadores globalmente e publique descobertas com revisão por pares transparente. Transforme a ciência em um processo aberto, reprodutível e acessível a todos.
                </p>
                <div className="space-y-4 mb-8">
                  {["Laboratórios descentralizados", "Revisão por pares transparente", "Publicação científica aberta"].map((item, index) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                    >
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="flex flex-nowrap gap-4">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                    <Link href="/labs/coming-soon">Explorar laboratórios</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-border text-foreground hover:bg-muted px-8 py-4 text-lg"
                  >
                    <Link href="/labs">Conhecer Syntropy Labs</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Portfolio Section */}
      <AnimatedSection id="portfolio">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto">
            <div>
              <div className="hidden md:block">
                <h2 className="text-4xl md:text-5xl font-medium mb-6">Seu currículo vivo no ecossistema Syntropy</h2>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Transforme cada ação no ecossistema Syntropy em conquista profissional. Cursos, projetos, contribuições open source e pesquisas científicas se integram automaticamente ao seu portfólio dinâmico. Comprove suas habilidades com evidências reais de impacto.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    "Cursos e certificações verificáveis",
                    "Projetos com métricas de impacto",
                    "Contribuições científicas documentadas",
                    "Histórico completo de colaborações",
                  ].map((item, index) => (
                    <motion.div
                      key={item}
                      className="flex items-center gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                    >
                      <Check className="h-5 w-5 text-primary" />
                      <span className="text-muted-foreground">{item}</span>
                    </motion.div>
                  ))}
                </div>
                <div className="flex flex-nowrap gap-4">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg">
                    <Link href="/portfolio">Começar meu portfólio</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-border text-foreground hover:bg-muted px-8 py-4 text-lg"
                  >
                    <Link href="/portfolio">Conhecer Portfólio Syntropy</Link>
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <PortfolioCard />
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Contribute Section */}
      <AnimatedSection id="contribute" className="bg-muted/50">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row-reverse items-center justify-center gap-12 max-w-5xl mx-auto py-12">
            <motion.div
              className="flex-1 text-center md:text-left hidden md:block"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: MOTION_DURATION }}
            >
              <h2 className="text-4xl md:text-5xl font-medium mb-6">
                Construa o futuro com a gente!
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-xl">
                O Syntropy é feito por pessoas como você. Contribua com código, ideias ou documentação e faça parte de uma comunidade que valoriza colaboração, inovação e impacto real. Toda contribuição conta!
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-10 py-4 text-xl">
                <Link href="/contribute">Quero contribuir</Link>
              </Button>
            </motion.div>
            <motion.div
              className="flex-1 flex justify-center"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: MOTION_DURATION, delay: 0.1 }}
            >
              <ContributeCard />
            </motion.div>
          </div>
        </div>
      </AnimatedSection>

      
      {/* CTA Section - Só aparece se autenticação estiver habilitada */}
      {isAuthEnabled() && !user && (
        <AnimatedSection id="cta" className="bg-muted/30">
          <div className="container mx-auto">
            <div className="text-center max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-medium mb-6">
                Pronto para fazer parte da{" "}
                <span className="text-primary">
                  revolução open-source?
                </span>
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Faça parte do ecossistema que conecta aprendizado prático, desenvolvimento colaborativo e pesquisa científica descentralizada.
              </p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground px-12 py-4 text-lg">
                <Link href="/auth?mode=signup">Começar minha jornada</Link>
              </Button>
            </div>
          </div>
        </AnimatedSection>
      )}
    </div>
  )
}