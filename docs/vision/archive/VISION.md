# Syntropy Ecosystem — Documento de Visão Geral

> **Document Type**: Ecosystem Overview / LLM Entry Point
> **Author**: José Eugênio
> **Created**: 2026-03-12
> **Last Updated**: 2026-03-12
> **Status**: Active

---

## Propósito e Instruções de Leitura

Este documento é o **ponto de entrada obrigatório** para qualquer LLM ou agente trabalhando no ecossistema Syntropy. Ele descreve o ecossistema, mapeia o conjunto de documentos de visão disponíveis e define como eles devem ser utilizados.

**Este documento não é a autoridade técnica sobre nenhum componente específico.** Ele mapeia o território — os documentos referenciados abaixo são as autoridades em seus respectivos domínios. Em caso de conflito entre o que está descrito aqui e o que está num documento de visão específico, o documento específico prevalece.

### Fluxo de Trabalho: Visão → Arquitetura → Implementação

Os documentos de visão existem para alimentar a criação de uma **documentação de arquitetura baseada em Domain-Driven Design (DDD)**. Esta documentação de arquitetura — bounded contexts, aggregates, entities, value objects, domain events, ubiquitous language, context maps — é o produto intermediário entre visão e código. A implementação começa somente após a documentação de arquitetura estar consolidada.

```
Documentos de Visão
        ↓
Documentação de Arquitetura (DDD)
        ↓
Implementação (Monorepo Turborepo + pnpm)
```

**Consequência direta para uso destes documentos:** ao ler os documentos de visão, o objetivo é extrair domínios, conceitos centrais, invariantes de negócio, relações entre entidades e fluxos de valor — não produzir decisões de implementação, escolhas de framework ou estrutura de código. Decisões de implementação são responsabilidade da etapa seguinte.

**Regra de leitura:** sempre que uma decisão de arquitetura envolver conceitos que cruzam pilares — artefatos, governança, distribuição de valor, portfólio, autenticação, event bus, sistema de agentes — consulte `syntropy-institution-protocol.md` e `syntropy-platform-vision.md` antes de qualquer modelagem. Esses dois documentos definem as primitivas que os pilares utilizam como dado.

---

## 1. O Que é o Syntropy

Syntropy é um ecossistema open source integrado que unifica aprendizado, criação e pesquisa em um ambiente coeso. A premissa central é que aprender, construir e pesquisar não são atividades separadas — são três dimensões de um único processo criativo — e que as ferramentas atuais forçam uma fragmentação artificial entre elas.

O ecossistema é organizado em **três pilares** e uma **camada de plataforma transversal**:

- **Syntropy Learn** — pilar de educação orientada a projetos
- **Syntropy Hub** — pilar de criação, colaboração e instituições digitais
- **Syntropy Labs** — pilar de pesquisa científica aberta e descentralizada
- **Syntropy Platform** — infraestrutura transversal que unifica os três pilares

Os pilares não são produtos independentes. São dimensões de um único sistema compartilhando autenticação, portfólio, event bus, design system, IDE integrado e o protocolo de instituições digitais. Um usuário navega entre eles sem ruptura de contexto.

**Open source é a identidade do projeto, não uma estratégia.** Todo o código, conteúdo, infraestrutura e governança do ecossistema são abertos. Isso não obriga os criadores que usam o ecossistema a adotar a mesma filosofia — criadores retêm autonomia total sobre monetização, privacidade e acesso ao que produzem. A abertura é do ecossistema, não uma imposição aos seus participantes.

---

## 2. Arquitetura de Alto Nível do Ecossistema

```
┌─────────────────────────────────────────────────────────┐
│                   Syntropy Platform                     │
│  (Site Institucional · Portfólio Dinâmico · IDE ·       │
│   Event Bus · Autenticação · Busca Unificada ·          │
│   Gamificação · Patrocínio · Sistema de Agentes de IA · │
│   Cooperative Grid · Protocolo de Instituições Digitais)│
├────────────────┬────────────────┬───────────────────────┤
│ Syntropy Learn │  Syntropy Hub  │    Syntropy Labs       │
│ (Educação)     │  (Criação /    │    (Pesquisa           │
│                │   Instituições)│     Científica)        │
└────────────────┴────────────────┴───────────────────────┘

Infraestrutura subjacente a todos os pilares:
Artefatos · IACP · Projetos Digitais · Instituições Digitais
Distribuição de Valor (AVUs) · Tesouro · Governança por Smart Contract
```

Toda produção intelectual ou técnica no ecossistema — um módulo educacional do Learn, um pacote de software do Hub, um dataset do Labs — é representada como um **artefato** sob o mesmo modelo. Isso garante que autoria, valor e reputação fluam automaticamente entre pilares sem exigir integrações ad hoc.

---

## 3. Estrutura de Repositório

Todo o ecossistema Syntropy reside em um **único repositório** gerenciado com **Turborepo** e **pnpm workspaces**. Esta é uma restrição arquitetural inegociável — não uma preferência de tooling. A separação entre pilares e componentes compartilhados é feita dentro do monorepo, não através de múltiplos repositórios.

### Organização do Monorepo

```
syntropy/                          ← raiz do monorepo
├── apps/
│   ├── learn/                     ← Syntropy Learn (aplicação)
│   ├── hub/                       ← Syntropy Hub (aplicação)
│   ├── labs/                      ← Syntropy Labs (aplicação)
│   └── platform/                  ← Syntropy Platform (aplicação)
├── packages/
│   ├── @syntropy/ui               ← design system unificado
│   ├── @syntropy/auth             ← autenticação compartilhada
│   ├── @syntropy/database         ← camada de dados compartilhada
│   ├── @syntropy/messaging        ← comunicação e event bus
│   └── @syntropy/contracts        ← smart contracts e protocolo de artefatos
├── turbo.json
└── pnpm-workspace.yaml
```

### Implicações para a Documentação de Arquitetura DDD

A estrutura de monorepo não determina os bounded contexts do DDD — os domínios de negócio descritos nos documentos de visão é que determinam. No entanto, a tradução de bounded contexts para workspaces deve respeitar as seguintes restrições:

Pilares são **aplicações independentes** dentro de `apps/` e não se importam diretamente entre si — comunicam via event bus e APIs bem definidas. Código transversal vive em `packages/`, nunca duplicado dentro dos apps; se um conceito aparece em dois pilares, ele pertence a um pacote compartilhado. O critério de alocação para `packages/` é: puramente visual → `@syntropy/ui`; lógica de domínio reutilizável entre pilares → pacote específico do domínio; lógica de negócio restrita a um único pilar → dentro do app do pilar. A comunicação entre Learn, Hub e Labs passa pela Platform (event bus, APIs) — nunca por importações diretas entre workspaces de apps.

---

## 4. Inventário de Documentos de Visão

### 4.1 `syntropy-institution-protocol.md`
**Autoridade técnica sobre o protocolo de infraestrutura do ecossistema**

Este é o documento mais denso do conjunto. Ele especifica formalmente a camada de infraestrutura que o ecossistema inteiro utiliza como primitiva: o modelo de artefatos, o IACP (Inter-Artifact Communication Protocol), o sistema de tipos extensível, o modelo de projetos digitais, o modelo de instituições digitais com governança por câmaras e cadeia de legitimidade, e o mecanismo de distribuição de valor via AVUs e tesouro por smart contract.

**O que este documento cobre:** definição formal de artefato como tripla `(Substance, Identity, UtilizationInterface)`; sistema de tipos extensível e aberto (`𝒯`); registro de identidade imutável publicado como evento Nostr com ancoragem em ledger; IACP em quatro fases (identificação, negociação, utilização, registro); estrutura do Projeto Digital (contrato de governança, manifesto de artefatos, protocolo de monetização, grafo de dependências emergente); estrutura da Instituição Digital (papéis, câmaras deliberativas, protocolo de deliberação, cadeia de legitimidade auditável); mecanismo de distribuição de valor (AVUs, tesouro, pesos estáticos/dinâmicos/híbridos, oráculo de câmbio); dez invariantes formais do sistema (I1 a I10); e rationale de design para todas as decisões não-óbvias.

**Conceitos centrais para modelagem DDD:** `Artifact`, `ArtifactType`, `IdentityRecord`, `UtilizationInterface`, `IACP`, `UsageAgreementEvent`, `UsageEvent`, `DigitalProject`, `ArtifactManifest`, `MonetizationProtocol`, `DependencyGraph`, `DigitalInstitution`, `Chamber`, `DeliberationProtocol`, `LegitimacyChain`, `AbstractValueUnit`, `Treasury`, `Oracle`.

**Atenção especial:** a hierarquia conceitual `Artefato → IACP → Projeto → Instituição → Valor` é uma dependência estrita — bounded contexts modelados a partir deste documento devem preservar essa ordem. AVUs não têm valor intrínseco e nunca são expostos como token especulativo. O grafo de dependências entre artefatos é emergente — construído automaticamente a partir de eventos IACP, nunca declarado manualmente. Contratos são vinculados à entidade artefato, não a versões individuais. O sistema de tipos é aberto e extensível — não existe enumeração fechada de tipos de artefato.

**Utilize este documento para:** identificar os aggregates centrais do ecossistema, mapear invariantes de domínio, definir domain events do protocolo de infraestrutura, e estabelecer a ubiquitous language compartilhada entre todos os bounded contexts.

---

### 4.2 `syntropy-platform-vision.md`
**Visão da camada transversal que unifica o ecossistema**

Este documento define a Syntropy Platform — a infraestrutura de produto que conecta os três pilares. A Platform não é um dos pilares; é a camada que os sustenta e integra. Todo componente que serve a mais de um pilar simultaneamente pertence à Platform e, na estrutura do monorepo, tem seu domínio representado em `packages/` ou na aplicação `apps/platform`.

**O que este documento cobre:** Problem Statement e Ideal Future do ecossistema como um todo; mapa de atores e papéis transversais; e os onze componentes da Platform: Site Institucional, Portfólio Dinâmico (com gamificação MMORPG-inspired — XP, levels, achievements, skill graph, reputation), Ambiente de Desenvolvimento Integrado (IDE), Sistema de Patrocínio, Autenticação Unificada, Comunicação e Fóruns, Busca Unificada cross-pillar, Governança e Planejamento do Ecossistema, Planning Board, Cooperative Grid (infraestrutura computacional distribuída da comunidade) e Sistema de Agentes de IA transversal.

**Conceitos centrais para modelagem DDD:** `DynamicPortfolio`, `ActivityRecord`, `GamificationLayer`, `XP`, `Achievement`, `SkillGraph`, `ReputationSystem`, `SponsorshipSystem`, `UnifiedAuth`, `EventBus`, `CooperativeGrid`, `AIAgentRegistry`, `UnifiedSearch`.

**Atenção especial:** gamificação, portfólio e reputação vivem na Platform — pilares produzem eventos que a Platform consome, nunca o contrário. O event bus é o mecanismo de integração entre bounded contexts de pilares distintos — a fronteira entre contextos é este canal, não importações diretas. O Design System é unificado para todo o ecossistema; ajustes por pilar são variações contextuais, não sistemas independentes. O Sistema de Agentes de IA é transversal: a infraestrutura central e o registro de agentes residem na Platform; casos de uso específicos por pilar referenciam esse componente.

**Utilize este documento para:** identificar o bounded context da Platform, mapear os domain events que fluem do event bus, definir a fronteira entre o que é responsabilidade da Platform versus dos pilares, e modelar os aggregates de portfólio e gamificação.

---

### 4.3 `syntropy-learn-vision-template.md`
**Visão do pilar de educação orientada a projetos**

Este documento define o Syntropy Learn. O princípio pedagógico central é **project-first**: o aprendizado é organizado em torno da construção de projetos reais, não de currículos de disciplinas. A prova de competência é o projeto construído, não o certificado emitido.

**O que este documento cobre:** Problem Statement e Ideal Future do pilar educacional; atores (Learner, Track Creator, Mentor, Community Member, Platform Administrator); estrutura do conteúdo educacional Ecossistema → Trilha → Curso → Fragmento, com estrutura obrigatória de fragmento **Problem → Theory → Artifact**; conceito de Projeto de Referência (cada trilha é organizada em torno de um projeto completo e real que o learner constrói progressivamente); Banco de Projetos; fluxo de onboarding com career discovery assistant e placement quiz; sistema de AI Copilot para Track Creators com cinco agentes especializados (Project Scoping, Curriculum Architect, Fragment Author, Pedagogical Consistency Validator e Iteration Agent); Artifact Gallery e dimensão social do aprendizado; e integração com Hub e Labs.

**Conceitos centrais para modelagem DDD:** `Track`, `Course`, `Fragment`, `Problem`, `Theory`, `Artifact`, `ReferenceProject`, `ProjectBank`, `LearnerProject`, `TrackCreator`, `AICopilotSystem`, `OnboardingFlow`, `ArtifactGallery`.

**Atenção especial:** fragmentos seguem estrutura fixa Problem → Theory → Artifact — esta é uma invariante de domínio do Learn, não uma convenção opcional. A prova de competência é o projeto, não o certificado — o portfólio é alimentado automaticamente via event bus, nunca por auto-declaração do learner. Track Creators projetam jornadas de construção em torno de um projeto de referência real e completo — o conteúdo educacional é subordinado ao projeto, não o contrário. O AI Copilot preserva autoria humana: assiste o Track Creator sem substituí-lo. XP, gamificação e portfólio são responsabilidade da Platform; Learn emite domain events e não implementa essas camadas internamente.

**Utilize este documento para:** modelar o bounded context do Learn, identificar aggregates pedagógicos (Track, Fragment, LearnerProject), definir domain events do ciclo de aprendizado, e especificar a fronteira entre Learn e Platform no que tange ao portfólio e gamificação.

---

### 4.4 `syntropy-hub-vision.md`
**Visão do pilar de criação, colaboração e instituições digitais**

Este documento define o Syntropy Hub — o pilar onde projetos e instituições digitais ganham vida. O Hub é a **interface de gestão e colaboração** construída sobre o protocolo de infraestrutura descrito em `syntropy-institution-protocol.md`. A relação é análoga à do GitHub com o Git: o Hub expõe o protocolo através de uma experiência de usuário, sem reimplementá-lo.

**O que este documento cobre:** Problem Statement e Ideal Future focado em instituições digitais e colaboração verificável; atores (Fundador de Instituição, Contribuidor, Mantenedor de Projeto, Membro de Instituição, Visitante, Administrador); a praça pública do Hub como espaço de descoberta de instituições, projetos e artefatos abertos; interface de criação e configuração de instituições com templates e assistentes; gestão de projetos (issues, roadmap, revisão de contribuições); dimensão hackin (sandbox): cada projeto tem uma dimensão principal e uma de exploração/experimentação paralela; integração bidirecional com Learn e Labs; e evolução progressiva da implementação (primeira versão inspirada no GitHub, evoluindo para o modelo completo de instituições digitais).

**Conceitos centrais para modelagem DDD:** `Institution`, `InstitutionFounder`, `ProjectMaintainer`, `Contributor`, `PublicSquare`, `ContributionReview`, `HackinDimension`, `InstitutionTemplate`, `GovernanceWizard`.

**Atenção especial:** o Hub não implementa o modelo de artefatos, IACP ou distribuição de valor — ele os expõe via interface de usuário. Toda lógica desses sistemas pertence à camada de infraestrutura definida em `syntropy-institution-protocol.md`. O modelo econômico de artefatos requer pesquisa aprofundada em economia, direito e sociologia antes de decisões de modelagem — a documentação de arquitetura do Hub pode inicialmente desconsiderar essa camada e modelá-la separadamente. Cada projeto tem duas dimensões: main e hackin (sandbox) — esta separação é uma invariante do domínio Hub. A governança de instituições é neutra; templates reduzem fricção sem restringir o que pode ser configurado.

**Utilize este documento para:** modelar o bounded context do Hub, identificar aggregates de gestão de projetos e instituições, definir domain events do ciclo de contribuição, e mapear a fronteira entre Hub e o protocolo de infraestrutura subjacente.

---

### 4.5 `syntropy-labs-vision.md`
**Visão do pilar de pesquisa científica aberta**

Este documento define o Syntropy Labs — o pilar dedicado à pesquisa científica descentralizada e aberta. Labs resolve problemas estruturais da ciência contemporânea: centralização da publicação, falta de reprodutibilidade, revisão por pares opaca, reputação pouco granular e barreira de entrada para pesquisadores sem afiliação institucional.

**O que este documento cobre:** Problem Statement focado nos problemas estruturais do sistema científico atual; Ideal Future centrado em ciência mais rigorosa, acessível, colaborativa e conectada; atores (Pesquisador Principal, Colaborador Científico, Revisor, Iniciante Científico, Diretor de Laboratório, Leitor Externo); modelo de laboratório como instituição digital; ciclo de pesquisa integrado (hipótese → metodologia → experimento → dados → artigo → revisão → publicação); escrita científica em MyST/LaTeX com renderização em tempo real; revisão aberta, pública e vinculada a trechos específicos do artigo; versionamento de artigos com histórico completo; experimentos executáveis como artefatos rodando na Cooperative Grid; geração e registro de DOIs; integração Learn–Labs; e sistema de reputação científica granular derivado do portfólio unificado.

**Conceitos centrais para modelagem DDD:** `Laboratory`, `ResearchLine`, `Hypothesis`, `Methodology`, `Experiment`, `ScientificArticle`, `ArticleVersion`, `PeerReview`, `ReviewAnnotation`, `DOI`, `ExecutableExperiment`, `ScientificReputation`.

**Atenção especial:** laboratórios são instituições digitais — toda a infraestrutura de governança definida em `syntropy-institution-protocol.md` se aplica a laboratórios sem modificação. Experimentos são artefatos — datasets, scripts, modelos treinados e simulações interativas são artefatos sob o modelo unificado, com autoria verificável. Labs não exige credencial acadêmica prévia; exige contribuição verificável — o sistema de reputação é parte do portfólio dinâmico da Platform, não um sistema separado implementado internamente pelo Labs. A integração Labs→Learn é bidirecional: artigos indicam trilhas relevantes; trilhas levam learners de volta ao Labs como revisores e potenciais colaboradores.

**Utilize este documento para:** modelar o bounded context do Labs, identificar aggregates do ciclo de pesquisa (ResearchLine, ScientificArticle, PeerReview), definir domain events do processo científico, e mapear a fronteira entre Labs e o protocolo de infraestrutura para laboratórios como instituições.

---

## 5. Ordem de Leitura Recomendada

A ordem abaixo respeita as dependências conceituais entre os documentos. Leitura fora dessa sequência pode levar a decisões de modelagem que contradizem invariantes definidas nas camadas inferiores.

```
1. syntropy-ecosystem-overview.md          ← você está aqui
        ↓
2. syntropy-institution-protocol.md       ← primitivas do protocolo de infraestrutura;
                                             define os conceitos que todos os demais
                                             documentos utilizam como dado
        ↓
3. syntropy-platform-vision.md             ← camada transversal; define o event bus,
                                             portfólio e o que pertence a packages/
        ↓
4. syntropy-hub-vision.md                  ← cliente primário do protocolo de
                                             infraestrutura; leia antes de Learn e Labs
        ↓
5. syntropy-learn-vision-template.md       ← pilar educacional; depende de artefatos
                                             e portfólio como primitivas já definidas
        ↓
6. syntropy-labs-vision.md                 ← pilar científico; depende de artefatos,
                                             instituições e integração com Learn e Hub
```

---

## 6. Princípios Arquiteturais Transversais

Estes princípios aparecem em todos os documentos de visão e devem ser preservados integralmente na documentação de arquitetura DDD resultante.

**Open source como identidade.** Todo o código, conteúdo e infraestrutura do ecossistema são open source. Não é negociável e não aparece como feature — é o ponto de partida de todo o sistema.

**Portfólio automático, nunca manual.** Nenhuma ação relevante do usuário deve exigir auto-declaração. O ecossistema registra via event bus; o portfólio consome. Qualquer modelo que exija que o usuário "adicione ao portfólio" viola este princípio.

**Atores são papéis, não tipos de usuário.** Um mesmo usuário pode ser learner, contributor, researcher e mentor simultaneamente. O domínio não cria categorias rígidas de usuário — lida com papéis que se sobrepõem e alternam.

**Artefatos sobre labor.** O que uma pessoa cria tem autoria verificável e permanente. Contribuição é uma relação contínua entre criador e artefato — não uma transação pontual.

**Visão antes de arquitetura; arquitetura antes de implementação.** Muitas decisões — especialmente o modelo econômico do Hub — requerem pesquisa antes de modelagem. A documentação de arquitetura deve sinalizar explicitamente onde há decisões pendentes de pesquisa.

**Governança neutra.** O ecossistema fornece primitivas configuráveis de governança — não impõe uma filosofia. Transparência (contratos públicos legíveis antes de qualquer participação) é o mecanismo que torna a liberdade responsável.

**Pilares integrados, não acoplados.** Na estrutura DDD: pilares são bounded contexts distintos que se comunicam exclusivamente via domain events no event bus e contratos de API — nunca por acoplamento direto entre contextos. Na estrutura do monorepo: apps não se importam entre si diretamente.

**Design system unificado.** Um único sistema de design para todo o ecossistema, traduzido no monorepo como `@syntropy/ui`. Nenhum pilar cria sua própria linguagem visual independente.

---

## 7. Decisões Que Não Devem Ser Alteradas

Os documentos de visão contêm decisões intencionais que podem parecer não-convencionais. Antes de propor alterações, verifique o rationale em `syntropy-institution-protocol.md` — as justificativas estão documentadas explicitamente.

**AVUs em vez de token de plataforma.** AVUs são unidades contábeis sem valor especulativo. A ausência de um token é deliberada para evitar misalinhamento de incentivos — modelar AVUs como token viola esta decisão.

**Sistema de tipos aberto e extensível.** Não existe enumeração fechada de tipos de artefato — novos tipos são registrados via evento sem modificar o protocolo central. Modelar tipos como enum fechado viola esta decisão.

**Grafo de dependências emergente.** O grafo é construído automaticamente a partir de eventos IACP — nunca declarado manualmente. Qualquer modelo que exija declaração manual de dependências contradiz este princípio.

**Contratos vinculados à entidade, não à versão.** Uma atualização de conteúdo de artefato não requer renegociação de contratos com dependentes.

**Estrutura fixa de fragmento no Learn.** Problem → Theory → Artifact não é uma convenção — é uma invariante de domínio. O modelo deve tratá-la como regra de negócio, não como configuração.

**Gamificação e reputação na Platform, não nos pilares.** syntropy-institution-protocolPilares emitem domain events; a Platform os transforma em portfólio, XP e reputação. Esta separação deve ser preservada no mapa de bounded contexts e refletida na separação entre apps e packages no monorepo.

---

## 8. Referência Rápida: Onde Encontrar o Quê

| Conceito | Documento Autoritativo |
|----------|------------------------|
| Modelo de artefato, IACP, invariantes | `.md` |
| Projetos e instituições digitais | `syntropy-institution-protocol.md` |
| AVUs, tesouro, distribuição de valor | `syntropy-institution-protocol.md` |
| Portfólio dinâmico, gamificação | `syntropy-platform-vision.md` |
| IDE integrado, Cooperative Grid | `syntropy-platform-vision.md` |
| Event bus, autenticação | `syntropy-platform-vision.md` |
| Sistema de agentes de IA (infraestrutura) | `syntropy-platform-vision.md` |
| Design system (`@syntropy/ui`) | `syntropy-platform-vision.md` |
| Estrutura de trilhas, fragmentos, Learn | `syntropy-learn-vision.md` |
| AI Copilot para Track Creators | `syntropy-learn-vision.md` |
| Interface do Hub, criação de instituições | `syntropy-hub-vision.md` |
| Dimensão hackin (sandbox) | `syntropy-hub-vision.md` |
| Gestão de projetos, issues, contribuições | `syntropy-hub-vision.md` |
| Publicação científica, revisão aberta | `syntropy-labs-vision.md` |
| Laboratórios, experimentos executáveis | `syntropy-labs-vision.md` |
| DOIs, indexação externa | `syntropy-labs-vision.md` |
| Estrutura do monorepo | Este documento (Seção 3) |