# Syntropy Labs — Vision Document

> **Document Type**: Vision Document
> **Author**: José Eugênio
> **Created**: 2026-03-12
> **Last Updated**: 2026-03-12
> **Status**: Draft

---

> **Nota sobre dependências**: Este documento pressupõe familiaridade com os documentos de visão da Syntropy Platform, Hub e Learn, bem como com as definições de Instituição, Projeto e Artefato estabelecidas na camada de plataforma do ecossistema. Conceitos como smart contracts de artefatos, camadas de identificação/conteúdo/utilização, sistema de reputação unificado e Portfólio Dinâmico não são redefinidos aqui — o Labs os utiliza como primitivas já especificadas.

---

## 1. Problem Statement

A ciência contemporânea enfrenta um conjunto de problemas estruturais que se reforçam mutuamente. O resultado é um sistema científico que, apesar de produzir conhecimento de enorme valor, o faz de maneira opaca, centralizada e inacessível à maior parte da humanidade.

**Centralização da publicação científica.** A validação e disseminação do conhecimento científico dependem quase inteiramente de periódicos acadêmicos controlados por poucas editoras privadas. Publicar exige submissão a processos fechados, taxas de publicação elevadas (APC — Article Processing Charges) que podem superar USD 10.000 por artigo, e aceitação de licenças que transferem direitos autorais dos pesquisadores para as editoras. Quem não pertence a uma instituição com acesso pago a essas bases simplesmente não lê ciência de fronteira.

**Falta de transparência e reprodutibilidade.** A grande maioria dos artigos científicos publica apenas os resultados — o código que gerou as análises, os datasets completos, os scripts de simulação e os parâmetros dos experimentos raramente acompanham o texto. Isso torna a reprodutibilidade uma exceção, não uma norma. Estudos estimam que mais de 50% dos resultados publicados em áreas como psicologia, medicina e ciências sociais não são reprodutíveis quando alguém tenta repetir o experimento. O artigo, como formato, foi concebido para o papel impresso e não evoluiu para aproveitar o potencial do meio digital.

**Revisão por pares limitada e opaca.** O sistema atual de peer review é realizado por dois ou três revisores anônimos, escolhidos pelos editores do periódico, sem qualquer visibilidade pública do processo. Não há como saber se um revisor tem conflito de interesse, qual é sua expertise real no tema ou se sua crítica foi considerada pelos autores. O processo é lento — revisões levam meses — e as respostas dos autores às críticas desaparecem nos bastidores. Uma vez publicado, o artigo é tratado como verdade imutável, mesmo que erros sejam identificados posteriormente.

**Reputação científica pouco granular.** O principal indicador de autoridade científica hoje é o índice H (h-index), que mede apenas o volume e o impacto das citações. Isso não distingue um especialista profundo em um nicho específico de um pesquisador prolífico em múltiplas áreas, não captura contribuições como revisões, datasets ou código, e favorece pesquisadores de instituições com maior visibilidade bibliométrica. Uma pessoa talentosa fora da academia formal não tem como construir reputação científica reconhecida.

**Barreira de entrada para novos pesquisadores.** Iniciar uma carreira científica exige afiliação institucional. Sem ela, não há acesso a bases bibliográficas, não há como submeter artigos a periódicos relevantes e não há como participar formalmente de colaborações científicas. Pesquisadores independentes, profissionais de mercado com contribuições científicas relevantes e iniciantes sem vínculo universitário ficam excluídos do sistema.

### Current Solutions

- **Periódicos acadêmicos tradicionais (Elsevier, Springer, Nature)**: Dominam a publicação científica de prestígio, mas são fechados, caros e controlados por atores privados com interesse comercial. O modelo é fundamentalmente contrário à ciência aberta.
- **arXiv e preprint servers**: Permitem publicação rápida e gratuita de preprints antes da revisão formal. São um avanço significativo em abertura, mas não oferecem revisão estruturada, não suportam artefatos interativos (código executável, simulações, datasets integrados) e não constroem reputação para os revisores.
- **GitHub + Jupyter Notebooks**: Pesquisadores usam repositórios GitHub para compartilhar código e dados, e Jupyter Notebooks para combinar narrativa e código executável. Mas são ferramentas desconectadas: não há fluxo integrado de publicação, revisão ou atribuição de autoria científica.
- **PubPeer e plataformas de post-publication review**: Permitem comentários públicos sobre artigos já publicados, mas são marginais ao processo científico oficial e não têm integração com os artefatos do artigo.
- **ResearchGate e Academia.edu**: Redes sociais científicas que facilitam networking e distribuição de PDFs, mas não resolvem nenhum dos problemas estruturais de transparência, reprodutibilidade ou revisão.
- **Open Journal Systems (OJS)**: Software open source para gestão de periódicos. Resolve a parte operacional da publicação aberta, mas não integra artefatos executáveis, não tem sistema de reputação sofisticado e não conecta a pesquisa com aprendizado ou desenvolvimento de projetos.

---

## 2. Ideal Future

No futuro que o Syntropy Labs pretende construir, qualquer pessoa com curiosidade científica genuína — seja um pesquisador de uma universidade renomada, um profissional de mercado com uma hipótese relevante ou um estudante sem afiliação formal — consegue participar do processo científico de maneira estruturada, transparente e reconhecida.

Um pesquisador abre o Labs e cria um laboratório. Em minutos, tem uma instituição científica funcional: com identidade, área de pesquisa, governança definida por smart contract e capacidade de receber colaboradores. Ele inicia uma linha de pesquisa — que é um projeto no ecossistema, com todas as ferramentas de gestão que isso implica — e começa a trabalhar: formula hipóteses, registra a metodologia, conduz experimentos (que podem ser artefatos executáveis rodando na Cooperative Grid), coleta dados (armazenados como datasets, também artefatos), escreve o artigo em MyST ou LaTeX diretamente na plataforma e vê a renderização em tempo real.

Quando o artigo está pronto para revisão, ele o publica. A partir desse momento, qualquer pessoa no ecossistema pode lê-lo e revisá-lo. As revisões ficam vinculadas a trechos específicos, são públicas e carregam o perfil de reputação do revisor — que inclui não apenas suas publicações anteriores no Labs, mas toda a sua trajetória no ecossistema Syntropy. O sistema filtra o ruído automaticamente, mas o autor pode ver tudo se quiser. Ele responde às críticas, incorpora o que faz sentido e publica uma nova versão — mantendo o histórico completo de todas as iterações.

Um estudante de doutorado em outra cidade lê o artigo e quer aprender mais sobre o tema. O Labs indica trilhas relevantes no Syntropy Learn que cobrem os fundamentos necessários. Ele conclui uma trilha, volta ao Labs, faz uma contribuição relevante como revisor e ganha reputação naquela área específica. Com o tempo, ele se torna colaborador do laboratório. Sua trajetória — desde a trilha que completou até a revisão que fez e a co-autoria que ganhou — aparece toda no Portfólio Dinâmico.

Quem lê o artigo fora do ecossistema acessa um DOI permanente. O artigo é indexado em bases acadêmicas externas. Um experimento interativo dentro do artigo pode ser acessado via link público por qualquer pessoa com um browser.

O resultado é uma ciência que é ao mesmo tempo mais rigorosa (porque toda a metodologia é verificável), mais acessível (porque não há paywall), mais colaborativa (porque a contribuição de cada pessoa é rastreada e reconhecida) e mais conectada com o mundo (porque os resultados alimentam diretamente projetos no Hub e trilhas no Learn).

---

## 3. Users and Actors

| Actor | Descrição | Necessidade Principal | Frequência | Nível Técnico |
|-------|-----------|----------------------|------------|---------------|
| Pesquisador Principal | Cientista ou pesquisador que lidera uma linha de pesquisa dentro de um laboratório | Gerenciar o ciclo completo de pesquisa, desde a hipótese até a publicação e evolução do artigo | Diária | Técnico / Alguns não-técnicos |
| Colaborador Científico | Pesquisador ou profissional que contribui para uma linha de pesquisa existente, sem necessariamente liderá-la | Contribuir com dados, código, revisões ou co-autoria dentro de uma linha de pesquisa ativa | Semanal / Sob demanda | Técnico |
| Revisor | Qualquer membro do ecossistema que lê e revisa artigos publicados | Encontrar artigos relevantes à sua área, fazer revisões estruturadas e ter suas contribuições reconhecidas no sistema de reputação | Sob demanda | Variado |
| Iniciante Científico | Estudante ou curioso sem afiliação acadêmica formal que quer aprender e contribuir com ciência | Descobrir pesquisas relevantes, acessar trilhas de aprendizado relacionadas no Learn e eventualmente contribuir como revisor ou colaborador | Semanal | Não-técnico / Alguns técnicos |
| Diretor de Laboratório | Gestor de uma instituição laboratório, responsável por definir governança, admitir membros e supervisionar linhas de pesquisa ativas | Configurar e manter o laboratório, definir as regras de operação via smart contract e acompanhar o progresso das pesquisas | Diária / Semanal | Técnico |
| Leitor Externo | Cientista, jornalista ou profissional fora do ecossistema Syntropy que acessa artigos publicados via DOI ou link público | Ler artigos e interagir com experimentos publicados sem precisar de conta no ecossistema | Sob demanda | Variado |

**Pesquisador Principal** — É o ator central do Labs. Ele trabalha no ciclo completo: define o problema, estrutura a metodologia, conduz experimentos (que podem ser artefatos executáveis ou experimentos físicos documentados), analisa resultados, escreve o artigo e o submete à revisão. Sua principal frustração com o sistema atual é a fragmentação: usa LaTeX num editor, dados no Google Drive, código no GitHub, revisão por e-mail e publica num sistema separado de todos os outros. No Labs, tudo isso vive num único lugar integrado.

**Iniciante Científico** — Este ator é particularmente importante para a missão do Labs. Ele representa a pessoa que tem interesse genuíno em ciência mas não tem acesso ao sistema acadêmico tradicional. O Labs precisa ser acolhedor para ele: ele deve poder ler artigos, entender os conceitos básicos (com apoio das trilhas do Learn indicadas pelo sistema), fazer revisões que sejam levadas a sério conforme ele constrói reputação, e eventualmente ser reconhecido como colaborador legítimo. O Labs não exige credencial acadêmica prévia — exige contribuição verificável.

---

## 4. Interface and Interaction Preferences

### Delivery Interfaces

- **[x] Web Application** — Interface principal do Labs. Usada por todos os atores para criar e gerir laboratórios, escrever e publicar artigos, conduzir revisões e descobrir pesquisas. Deve ser responsiva, com experiência otimizada para desktop (onde ocorre a maior parte do trabalho de pesquisa e escrita) mas funcional em mobile para leitura e revisão. Requer autenticação para contribuir; leitura de artigos públicos pode ser sem login.
- **[x] REST API** — Necessária para integração com o restante do ecossistema (Hub, Learn, Platform) via event bus, e para permitir que experimentos executáveis interajam com dados e serviços externos. Também usada para indexação externa (DOI, bases bibliográficas).
- **[x] Background Service / Worker** — Processos assíncronos para: renderização de artigos em MyST/LaTeX, execução de experimentos interativos na Cooperative Grid, cálculo de métricas de reputação, geração e registro de DOIs, notificações por tema de interesse.
- **[x] Embedded / SDK** — Experimentos interativos publicados como artefatos devem poder ser acessados via link público (embed), permitindo que qualquer pessoa interaja com um experimento a partir de um browser sem ter conta no ecossistema.

### Interaction Style

- **[x] Self-service** — Pesquisadores criam laboratórios, linhas de pesquisa e artigos de forma autônoma, sem aprovação centralizada.
- **[x] Power-user / Expert-first** — A interface de escrita (MyST/LaTeX) e a gestão de laboratórios assumem usuários com capacidade técnica. A profundidade e a composabilidade são prioritárias para os atores principais.
- **[x] Guided / Wizard-driven** — Para iniciantes científicos e para fluxos menos frequentes (como criar um laboratório pela primeira vez ou submeter um artigo à revisão pela primeira vez), fluxos guiados reduzem a barreira de entrada.
- **[x] Collaborative** — Múltiplos pesquisadores trabalham simultaneamente em linhas de pesquisa, artigos e experimentos. Revisões são colaborativas e públicas.

O Labs deve ter dois modos distintos de experiência: um modo de **trabalho** (escrita de artigos, gestão de experimentos, análise de revisões) que é denso, eficiente e voltado a especialistas; e um modo de **descoberta** (explorar artigos, encontrar laboratórios, ler pesquisas) que é acessível, navegável e acolhedor para quem está chegando pela primeira vez.

### Accessibility Requirements

A interface de leitura e descoberta de artigos deve seguir WCAG 2.1 AA, dado o objetivo de democratizar o acesso à ciência. A interface de escrita (MyST/LaTeX) pode ter requisitos menos restritivos, dado o perfil técnico dos usuários principais.

---

## 5. System Components and Subsystem Visions

O Syntropy Labs é organizado em três componentes principais. Cada componente representa um domínio coerente do sistema, com seu próprio conjunto de atores primários, caráter de design e vocabulário. Os subcomponentes dentro de cada um representam áreas de negócio distintas que, embora partilhem a mesma infraestrutura, têm regras, conceitos e fluxos suficientemente específicos para serem tratados separadamente durante a arquitetura.

---

### Component 1: Ciclo de Pesquisa

**Type**: Web App + Background Service

**Primary users**: Pesquisador Principal, Colaborador Científico, Diretor de Laboratório

**Purpose in one sentence**: Oferecer ao pesquisador um ambiente integrado para conduzir o ciclo completo de pesquisa científica — da constituição do laboratório e formulação de hipóteses até a produção de artefatos, execução de experimentos e escrita do artigo — sem precisar sair da plataforma.

**Design character**: Deve se sentir como uma combinação entre um sistema de gestão de projetos acadêmico (Linear pela estrutura e clareza, mas com o vocabulário da ciência) e um caderno de laboratório digital (onde cada etapa da pesquisa deixa registro verificável). Profissional, denso em informação e sem fricção para pesquisadores que já sabem o que estão fazendo.

**Key design principles**:
- O ciclo de pesquisa é o eixo central do Labs: tudo o que o pesquisador faz — configurar o laboratório, planejar, executar experimentos, coletar dados, escrever — acontece dentro deste componente.
- Laboratório e linha de pesquisa são tipagens sobre primitivas do ecossistema: um laboratório é uma Instituição com tipagem `laboratory`; uma linha de pesquisa é um Projeto com tipagem `research-line`. O Labs não recria a lógica de gestão — ela já existe; o Labs adiciona o contexto científico.
- O smart contract do laboratório é o centro da governança: quem pode criar linhas de pesquisa, publicar artefatos e definir regras de co-autoria é configurado pelo Diretor de Laboratório na criação da instituição e pode evoluir conforme a governança do grupo permitir.
- Cada etapa do ciclo produz artefatos rastreáveis: hipóteses documentadas, metodologias versionadas, datasets associados, experimentos executados e artigos escritos são todos artefatos no ecossistema — não documentos soltos.

**What success looks like**: Um pesquisador consegue criar um laboratório funcional, iniciar uma linha de pesquisa, adicionar colaboradores e registrar as primeiras hipóteses em menos de 20 minutos. Ao longo da pesquisa, o histórico completo do trabalho — decisões, iterações, artefatos produzidos — está sempre disponível e auditável.

#### Sub-components do Ciclo de Pesquisa

| Sub-componente | Propósito | Conceitos-chave | Vocabulário ou Regras Específicas |
|----------------|-----------|-----------------|-----------------------------------|
| Gestão de Laboratórios | Ciclo de vida da instituição laboratório: criação, configuração, membros e governança | Laboratório, Diretor, Membro, Smart Contract de Laboratório, Área de Pesquisa | Um laboratório é uma Instituição com tipagem `laboratory`; sua governança é definida no smart contract na criação; pode ser público ou privado |
| Gestão de Linhas de Pesquisa | Planejamento e acompanhamento das linhas de pesquisa: hipóteses, metodologia, progresso e co-autoria | Linha de Pesquisa, Hipótese, Metodologia, Status, Co-autor, Etapa do Ciclo | Uma linha de pesquisa é um Projeto com tipagem `research-line`; estrutura o ciclo completo — do D0 (problema) até a publicação; todo artefato produzido fica associado à linha |
| Produção e Gestão de Artefatos Científicos | Criação, versionamento e associação de todos os artefatos produzidos numa linha de pesquisa: artigos, datasets, código, notebooks | Artefato Científico, Dataset, Código de Pesquisa, Notebook, Versão | Artefatos seguem as três camadas definidas na Platform (identificação, conteúdo, utilização); a camada de utilização define permissões de acesso, revisão e reuso |
| Experimentos Interativos | Criação e execução de experimentos reproduzíveis que rodam no browser, hospedados na Cooperative Grid, com coleta de dados integrada ao ecossistema | Experimento, Participante, Condição Experimental, Rodada, Dataset Resultante | Experimento é um artefato com tipagem `experiment`; inspirado no modelo oTree; pode ser acessado por link público sem conta no ecossistema; dados coletados geram automaticamente um dataset associado à linha de pesquisa |
| Editor de Artigos Científicos | Interface de escrita com suporte a MyST e LaTeX, renderização em tempo real e referenciamento de artefatos diretamente no corpo do texto | Artigo, Seção, Referência, Artefato Embebido, Parâmetro Dinâmico, Versão | O artigo é um Artefato com tipagem `scientific-article`; pode conter componentes executáveis (gráficos interativos, experimentos embutidos) renderizados via Cooperative Grid |

**Experimentos Interativos** (expanded): Este subcomponente merece atenção especial por sua natureza técnica distinta. Inspirado no oTree, o sistema permite que pesquisadores criem experimentos comportamentais, surveys interativos e simulações que rodam diretamente no browser, com participação de múltiplos usuários simultâneos. O experimento é um artefato de primeira classe: tem smart contract próprio que define quem pode participar, por quanto tempo fica ativo e como os dados são tratados. Participantes externos (sem conta no ecossistema) podem acessar via link público, conforme as regras do laboratório. Os dados coletados são armazenados automaticamente como um dataset vinculado à linha de pesquisa, mantendo a rastreabilidade completa da proveniência. Na fase MVP, o foco está em experimentos simples (surveys, questionários, tarefas de decisão); experimentos multiplayer e com agentes são funcionalidade futura.

---

### Component 2: Publicação e Revisão por Pares

**Type**: Web App + Background Service

**Primary users**: Pesquisador Principal, Revisor, Iniciante Científico, Colaborador Científico

**Purpose in one sentence**: Gerenciar o ciclo de publicação científica aberta — da submissão pública de um artigo à revisão contínua por pares, às respostas dos autores e à evolução versionada do trabalho — mantendo todo o histórico permanentemente visível e auditável.

**Design character**: Deve se sentir como uma combinação entre o sistema de code review do GitHub (comentários vinculados a trechos específicos, threads de discussão estruturadas, histórico imutável de versões) e um periódico científico aberto. A gravidade do contexto acadêmico precisa estar presente: não é uma rede social, é um registro científico público. Ao mesmo tempo, deve ser mais rápido e menos burocrático do que qualquer periódico tradicional.

**Key design principles**:
- Publicar é uma decisão explícita e irreversível para aquela versão: uma vez publicada, a versão existe permanentemente com seu DOI, independentemente do que acontecer depois.
- Revisão é pós-publicação e contínua: qualquer pessoa pode revisar qualquer artigo público a qualquer momento; não há período fechado de revisão.
- O sistema de reputação é o filtro, não a censura: revisões ruins não são removidas, apenas ficam menos visíveis para quem usa os filtros; o autor sempre vê tudo.
- A evolução do artigo é uma conversa documentada: cada nova versão deve registrar quais revisões foram endereçadas; o histórico completo — versões, revisões, respostas — é público para sempre.

**What success looks like**: Um artigo publicado recebe revisões de múltiplas pessoas com diferentes perfis de expertise. Os autores respondem, incorporam sugestões, publicam versões melhoradas. Cinco anos depois, qualquer pessoa pode reconstruir toda a história daquele artigo — quem revisou, o que disse, o que foi incorporado, o que foi rejeitado e por quê.

#### Sub-components de Publicação e Revisão por Pares

| Sub-componente | Propósito | Conceitos-chave | Vocabulário ou Regras Específicas |
|----------------|-----------|-----------------|-----------------------------------|
| Publicação de Artefatos Científicos | Controle do ciclo de publicação: do rascunho interno à versão pública com DOI; interoperabilidade com o ecossistema acadêmico externo | Versão Publicada, DOI, Changelog, Preprint, Indexação Externa | Publicar é irreversível para aquela versão; cada versão publicada recebe um DOI único via DataCite/CrossRef; publicar ativa automaticamente o fluxo de revisão por pares |
| Revisão por Pares Aberta | Interface para leitura, anotação e revisão pública de artigos; gestão de threads de discussão vinculadas a trechos específicos | Revisão, Comentário Vinculado, Thread, Trecho Anotado, Resposta do Autor | Revisões são vinculadas à versão específica revisada; qualquer usuário do ecossistema pode revisar; revisores externos ao ecossistema não são suportados no MVP |
| Filtro e Reputação de Revisores | Mecanismo de ordenação e filtragem de revisões com base no perfil de expertise do revisor na área temática do artigo | Nível de Expertise, Área Temática, Filtro por Reputação, Revisão Relevante | Usa o sistema de reputação unificado da Platform com a dimensão de área temática específica; revisões de baixa reputação ficam filtradas por padrão, mas visíveis se solicitado — análogo à caixa de spam |
| Evolução Versionada e Resposta a Revisões | Ciclo de resposta dos autores: endereçar revisões, publicar novas versões e registrar o que foi incorporado em cada iteração | Nova Versão, Revisão Endereçada, Revisão Incorporada, Revisão Rejeitada, Histórico Público | Cada nova versão deve referenciar as revisões que motivaram as mudanças; o histórico completo de todas as versões e suas revisões é permanente e imutável |

---

### Component 3: Ambiente Social Científico

**Type**: Web App

**Primary users**: Todos os atores, com ênfase em Iniciante Científico e Leitor Externo

**Purpose in one sentence**: Ser a camada social e de descoberta do Labs — o espaço onde qualquer pessoa, dentro ou fora do ecossistema, encontra ciência relevante, conecta-se com laboratórios e pesquisadores, e recebe pontes para o restante do ecossistema Syntropy.

**Design character**: Deve se sentir como uma biblioteca científica moderna e viva — organizada com a seriedade de uma base bibliográfica acadêmica (busca por área, autor, laboratório, data de publicação), mas com a vitalidade de uma comunidade ativa (pesquisas em andamento, revisões recentes, laboratórios buscando colaboradores). Acessível para um estudante sem formação formal e útil para um pesquisador sênior buscando colaborações.

**Key design principles**:
- Artigos públicos são acessíveis sem conta: a leitura não exige autenticação; apenas contribuir (revisar, colaborar) exige identidade no ecossistema.
- Descoberta é uma funcionalidade de primeira classe: artigos, laboratórios e linhas de pesquisa devem ser encontráveis por busca textual, área temática e navegação — não apenas por quem já conhece o laboratório.
- O Labs é uma porta de entrada para o ecossistema: quando um iniciante científico lê um artigo, o sistema sugere trilhas no Learn para entender melhor o tema e projetos no Hub onde os resultados estão sendo aplicados. A integração cross-pilar é parte da experiência de descoberta, não um menu escondido.
- A translação de resultados é sempre intencional: o sistema sugere e facilita conexões entre Labs, Hub e Learn, mas a decisão de criar um projeto ou uma trilha a partir de uma pesquisa pertence ao pesquisador.

**What success looks like**: Um iniciante científico chega ao Labs por interesse num tema, encontra artigos relevantes, recebe sugestões de trilhas no Learn que o preparam para contribuir, faz sua primeira revisão e começa a construir reputação científica — tudo num fluxo contínuo que o sistema facilita sem necessidade de saber de antemão como o ecossistema funciona.

#### Sub-components do Ambiente Social Científico

| Sub-componente | Propósito | Conceitos-chave | Vocabulário ou Regras Específicas |
|----------------|-----------|-----------------|-----------------------------------|
| Descoberta e Busca de Artigos | Busca full-text e por metadados em artigos e laboratórios públicos; navegação por área temática | Artigo Público, Área Temática, Laboratório, Autor, Palavra-chave, Ranking de Relevância | Indexa apenas artefatos com visibilidade pública; artigos privados não aparecem; a lógica de ranking considera relevância temática e nível de atividade do laboratório |
| Feed de Atividade e Notificações | Fluxo de atividade científica recente e sistema de assinaturas por área ou laboratório | Feed, Notificação, Assinatura de Área, Assinatura de Laboratório, Evento de Publicação | Usuários assinam áreas temáticas ou laboratórios; notificações são disparadas por eventos de publicação (nova versão, novo artigo, nova linha de pesquisa pública) |
| Integração Cross-Pilar | Sugestão contextual de trilhas do Learn e projetos do Hub relacionados ao conteúdo científico sendo visualizado; mecanismo de translação de resultados de pesquisa | Trilha Sugerida, Projeto Relacionado, Translação, Origem da Pesquisa | Sugestões são geradas automaticamente com base em área temática e tags; a translação formal (criar projeto no Hub ou trilha no Learn a partir da pesquisa) é sempre uma ação deliberada do pesquisador; a origem da pesquisa fica registrada no Portfólio Dinâmico |

---

## 5a. Domain Priorities — Core, Supporting, and Generic

### Classification Table

| Área de Negócio | Componente | Tipo | Justificativa | Estratégia |
|-----------------|------------|------|---------------|------------|
| Ciclo completo de pesquisa do D0 à publicação | Ciclo de Pesquisa | Core | Nenhuma plataforma existente integra gestão de laboratório, planejamento de hipóteses, execução de experimentos, coleta de dados e escrita de artigos num único ciclo coerente | Construir com modelo de domínio rico; o fluxo do ciclo de pesquisa é o eixo central do Labs |
| Experimentos interativos executáveis | Ciclo de Pesquisa | Core | Não existe plataforma que integre experimentos científicos executáveis diretamente ao ciclo de publicação e ao artigo como artefato de primeira classe | Começar com experimentos simples (surveys, tarefas de decisão); evoluir para experimentos multiplayer e com agentes |
| Editor de artigos científicos (MyST/LaTeX + artefatos embebidos) | Ciclo de Pesquisa | Core | Nenhuma plataforma científica atual combina escrita acadêmica estruturada com artefatos executáveis integrados e versionamento imutável num ambiente de autoria único | Construir com cuidado; a qualidade do editor é determinante para a adoção por pesquisadores |
| Revisão por pares aberta, contínua e vinculada a trechos | Publicação e Revisão | Core | É o diferencial central do Labs em relação a qualquer sistema de publicação existente: revisão pública, permanente, vinculada ao texto e integrada ao sistema de reputação | Alto investimento em UX e lógica de domínio; o modelo de revisão é o que diferencia o Labs do arXiv |
| Evolução versionada de artigos com histórico público | Publicação e Revisão | Core | A imutabilidade de versões publicadas combinada com a rastreabilidade de cada iteração é uma proposta técnica e filosófica que nenhum periódico tradicional oferece | Definir bem o modelo de versões e a relação entre versão, revisão e DOI |
| Gestão de laboratórios e linhas de pesquisa | Ciclo de Pesquisa | Supporting | Laboratório é uma Instituição, linha de pesquisa é um Projeto — o Labs usa primitivas já definidas na Platform com tipagem específica; a lógica de gestão já existe | Reutilizar infraestrutura de Instituições e Projetos; adicionar apenas campos e comportamentos do contexto científico |
| Sistema de reputação científica por área temática | Publicação e Revisão | Supporting | Necessário para o fluxo de revisão funcionar, mas a lógica de reputação é definida na Platform — o Labs adiciona apenas a dimensão de área temática | Usar o sistema de reputação da Platform; não construir lógica paralela |
| Descoberta e busca de artigos | Ambiente Social | Supporting | Essencial para o Labs funcionar como ciência aberta, mas a lógica de busca e indexação é infraestrutura de plataforma com contexto científico adicionado | Implementar com foco em relevância científica; integrar com a busca geral do ecossistema |
| Integração cross-pilar (Learn e Hub) | Ambiente Social | Supporting | Necessário para fechar o ciclo pesquisa → aprendizado → criação, mas a lógica de comunicação entre pilares é definida pela Platform via event bus | Implementar como sugestão contextual; a translação formal fica a cargo do pesquisador |
| Renderização MyST/LaTeX | Ciclo de Pesquisa | Generic | MyST tem renderizador open source maduro (MyST-Parser); LaTeX tem ecossistema consolidado; não há vantagem em construir renderizador próprio | Usar bibliotecas existentes; contribuir upstream se necessário |
| Geração e registro de DOIs | Publicação e Revisão | Generic | Problema resolvido; APIs padrão da DataCite e CrossRef são amplamente adotadas | Integrar via API com provedor de DOIs estabelecido |
| Autenticação e identidade | Todos | Generic | Gerenciado pela Platform — autenticação unificada do ecossistema | Usar o sistema de auth da Platform sem duplicação |
| Notificações e e-mail | Ambiente Social | Generic | Problema genérico e bem resolvido pela infraestrutura da Platform | Usar a infraestrutura de notificações da Platform |

### Core Domain Statement

O diferencial irreplicável do Syntropy Labs está na integração de três capacidades que nenhuma plataforma científica atual oferece em conjunto: o ciclo completo de pesquisa — da hipótese à publicação — conduzido num único ambiente com experimentos executáveis como artefatos de primeira classe; revisão por pares aberta, contínua e rastreável, integrada ao sistema de reputação do ecossistema; e artigos como artefatos vivos e versionados, cujo histórico completo — versões, revisões, respostas, dados — é público e permanente. É a primeira plataforma onde pesquisar, aprender e construir fazem parte do mesmo ciclo.

---

## 6. Key Capabilities

| # | Capacidade | Descrição | Prioridade |
|---|------------|-----------|------------|
| 1 | **Criar e operar laboratórios de pesquisa** | Qualquer usuário do ecossistema pode criar um laboratório (instituição do tipo `laboratory`), configurar sua governança via smart contract, definir áreas de pesquisa e admitir membros e colaboradores | MVP |
| 2 | **Gerenciar linhas de pesquisa** | Dentro de um laboratório, pesquisadores criam e gerenciam linhas de pesquisa (projetos do tipo `research-line`), associando hipóteses, metodologia, artefatos produzidos e status de progresso | MVP |
| 3 | **Escrever e versionar artigos científicos** | Interface de escrita com suporte a MyST e LaTeX, renderização em tempo real, referenciamento de artefatos (datasets, código, experimentos) e versionamento imutável de cada publicação | MVP |
| 4 | **Publicar artigos e ativar revisão por pares** | Publicação explícita de uma versão do artigo que a torna pública e abre o fluxo de revisão; cada versão publicada recebe um DOI | MVP |
| 5 | **Revisar artigos publicamente** | Qualquer usuário do ecossistema pode revisar artigos publicados, vinculando comentários a trechos específicos; revisões são públicas e carregam o perfil de reputação do revisor | MVP |
| 6 | **Filtrar revisões por reputação** | O sistema exibe revisões filtradas pelo nível de expertise do revisor na área temática do artigo; o autor pode ver todas as revisões independentemente do filtro | MVP |
| 7 | **Responder revisões e publicar novas versões** | Autores podem responder às revisões, incorporar sugestões e publicar novas versões do artigo; o histórico completo de todas as versões e suas revisões é permanentemente público | MVP |
| 8 | **Descobrir artigos e laboratórios** | Busca full-text e por metadados em artigos públicos, navegação por área temática, filtros por laboratório e autor | MVP |
| 9 | **Seguir áreas e laboratórios e receber notificações** | Usuários podem assinar áreas temáticas ou laboratórios específicos e receber notificações quando novos artigos forem publicados | MVP |
| 10 | **Integração cross-pilar: sugestão de trilhas e projetos** | Ao visualizar uma linha de pesquisa ou artigo, o sistema sugere trilhas relevantes no Learn e projetos relacionados no Hub, facilitando a entrada de iniciantes e a translação de resultados | MVP |
| 11 | **Criar e publicar experimentos interativos** | Pesquisadores criam experimentos executáveis (inspirados no modelo oTree) que rodam no browser via Cooperative Grid, podem ser embutidos em artigos e acessados por link público | Post-MVP |
| 12 | **Gerenciar datasets como artefatos científicos** | Datasets são artefatos versionáveis associados a linhas de pesquisa; podem ser referenciados em artigos e têm sua proveniência rastreada no ecossistema | Post-MVP |
| 13 | **Indexação externa e DOI** | Artigos publicados recebem DOIs e são indexados em bases bibliográficas externas (Google Scholar, OpenAlex), garantindo interoperabilidade com o ecossistema acadêmico global | Post-MVP |
| 14 | **Colaboração entre laboratórios e instituições** | Linhas de pesquisa podem ter colaboradores de diferentes laboratórios e instituições; a atribuição de autoria segue as regras definidas no smart contract do laboratório | Post-MVP |
| 15 | **Translação formal de resultados para Hub e Learn** | Mecanismo que permite ao pesquisador iniciar formalmente a criação de um projeto no Hub ou uma trilha no Learn a partir dos resultados de uma linha de pesquisa concluída | Future |

---

## 7. Information and Concepts

| Conceito | Descrição | Informações-chave | Relacionado a | Criador | Ciclo de Vida |
|----------|-----------|-------------------|---------------|---------|---------------|
| Laboratório | Instituição do ecossistema com tipagem `laboratory`, que organiza linhas de pesquisa e define a governança científica do grupo | Nome, área(s) de pesquisa, membros, smart contract, visibilidade (público/privado) | Instituição (Platform), Linha de Pesquisa, Artefatos Científicos | Qualquer usuário do ecossistema | Ativo → Inativo → Arquivado |
| Linha de Pesquisa | Projeto do ecossistema com tipagem `research-line`, que organiza o trabalho científico em torno de uma hipótese ou questão de pesquisa | Hipótese, metodologia, status, membros/co-autores, artefatos associados, área temática | Projeto (Platform), Laboratório, Artigo, Dataset, Experimento | Membros do laboratório com permissão | Rascunho → Ativa → Concluída → Arquivada |
| Artigo Científico | Artefato do ecossistema com tipagem `scientific-article`, escrito em MyST ou LaTeX, versionável e publicável com DOI | Título, autores, abstract, corpo (MyST/LaTeX), referências, artefatos embebidos, versões, DOI por versão, área temática | Artefato (Platform), Linha de Pesquisa, Revisão, Dataset, Experimento | Membros da linha de pesquisa | Rascunho → Submetido para Revisão Interna → Publicado (v1, v2, ...) |
| Revisão | Contribuição pública de um membro do ecossistema sobre uma versão específica de um artigo publicado, vinculada a trechos do texto | Revisor, versão revisada, comentários vinculados a trechos, data, status (aberta, respondida), avaliação de relevância | Artigo Científico, Usuário Revisor, Sistema de Reputação | Qualquer usuário do ecossistema | Publicada → Respondida → Incorporada / Não incorporada |
| Dataset | Artefato do ecossistema com tipagem `dataset`, que armazena dados coletados em uma linha de pesquisa e pode ser referenciado em artigos | Formato, tamanho, metadados, proveniência (vinculada à linha de pesquisa ou experimento), versão, licença de uso | Artefato (Platform), Linha de Pesquisa, Artigo, Experimento | Membros da linha de pesquisa | Rascunho → Publicado → Versionado |
| Experimento | Artefato do ecossistema com tipagem `experiment`, que implementa um experimento executável rodando no browser via Cooperative Grid | Tipo (comportamental, survey, simulação), parâmetros, participantes, dados coletados (→ Dataset), link público | Artefato (Platform), Linha de Pesquisa, Artigo, Dataset, Cooperative Grid | Membros da linha de pesquisa | Rascunho → Ativo (aceitando participantes) → Encerrado |
| Área Temática | Categoria científica usada para classificar linhas de pesquisa, artigos e a expertise dos revisores no sistema de reputação | Nome, hierarquia (área geral → subárea), artigos e laboratórios associados | Linha de Pesquisa, Artigo, Sistema de Reputação (Platform), Laboratório | Criada pelos usuários / Curada pela comunidade | Ativa → Mesclada / Depreciada |

**Artigo Científico** — É o artefato central do Labs e merece atenção especial em seu ciclo de vida. Um artigo começa como rascunho dentro de uma linha de pesquisa. Ele pode ser iterado internamente pelo grupo antes de ser publicado. A publicação é uma ação explícita e irreversível para aquela versão: uma vez publicada, a versão v1 existe permanentemente, com seu DOI, e abre o fluxo de revisão pública. Quando os autores respondem às revisões e decidem publicar uma versão melhorada, criam a v2 — que coexiste com a v1, que permanece citável. O artigo como entidade é a soma de todas as suas versões, mais o histórico de revisões de cada uma.

**Área Temática** — É o vocabulário comum que conecta laboratórios, linhas de pesquisa, artigos e revisores. O sistema de reputação usa as áreas temáticas para calcular a expertise de um revisor num domínio específico. Inicialmente, o Labs pode partir de uma taxonomia padrão (como a classificação MSC para matemática, ou a ACM CCS para computação) e permitir que usuários criem subáreas. A curadoria das áreas é um problema de governança que precisa evoluir com a comunidade.

---

## 8. Workflows and Journeys

### Workflow 1: Ciclo Completo de Publicação de um Artigo

**Actor**: Pesquisador Principal (com Colaboradores Científicos)
**Goal**: Conduzir uma linha de pesquisa do início à publicação revisada de um artigo
**Trigger**: Pesquisador tem uma hipótese ou questão de pesquisa e quer conduzi-la de forma estruturada
**Frequency**: Sob demanda (o ciclo completo leva semanas a meses)
**Volume**: Uma linha de pesquisa por vez, com múltiplos colaboradores simultâneos

**Steps**:
1. O pesquisador acessa o Labs e cria um laboratório (se ainda não tiver um), configurando o smart contract com as regras de co-autoria, visibilidade e permissões de revisão.
2. Dentro do laboratório, ele cria uma linha de pesquisa, descrevendo a hipótese central, a metodologia planejada e a área temática.
3. Ele adiciona colaboradores à linha de pesquisa, que passam a ter acesso ao artefato em edição.
4. Ao longo da pesquisa, artefatos são criados e associados à linha: datasets (dados coletados), experimentos (se aplicável), código de análise. Esses artefatos são referenciados pelo artigo em construção.
5. O pesquisador escreve o artigo em MyST ou LaTeX no editor integrado, vendo a renderização em tempo real. Artefatos são embutidos no corpo do texto onde fazem sentido.
6. Quando o artigo está pronto, o pesquisador decide publicá-lo. Ele confirma a ação — publicar é irreversível para aquela versão. O sistema gera o DOI e torna o artigo v1 público.
7. O artigo aparece no feed de descoberta do Labs, nas buscas por área temática e notifica usuários que seguem a área.
8. Revisores leem o artigo e submetem revisões vinculadas a trechos específicos. O pesquisador filtra as revisões por reputação e analisa as contribuições.
9. O pesquisador responde às revisões relevantes, incorpora melhorias ao texto e publica a v2. O sistema vincula automaticamente as revisões respondidas à nova versão.
10. O processo se repete quantas versões forem necessárias. A linha de pesquisa é marcada como concluída quando o grupo entende que o trabalho está maduro.

**Variations**: A linha de pesquisa pode ser privada durante todo o processo, com o artigo publicado apenas quando pronto. Colaboradores podem ter níveis de permissão distintos (leitura, edição, co-autoria). O pesquisador pode publicar uma versão de preprint antes de uma versão mais completa.

---

### Workflow 2: Iniciante Científico Descobre e Contribui com uma Pesquisa

**Actor**: Iniciante Científico
**Goal**: Encontrar uma pesquisa relevante, entender o contexto e fazer sua primeira contribuição
**Trigger**: O usuário chega ao Labs por interesse genuíno em um tema (pode ter chegado via Learn, via Hub ou diretamente)
**Frequency**: Semanal (para usuários que estão ativamente se envolvendo com a comunidade científica)
**Volume**: Individual

**Steps**:
1. O usuário acessa a interface de descoberta do Labs e busca por um tema de interesse (ex: "aprendizado de máquina em bioinformática").
2. O sistema retorna artigos publicados, laboratórios ativos e linhas de pesquisa em andamento relacionados ao tema.
3. O usuário clica em um artigo e começa a ler. O sistema, percebendo que ele não tem reputação na área, sugere trilhas do Learn que cobrem os conceitos fundamentais do artigo.
4. O usuário completa uma ou mais trilhas do Learn que o preparam para entender melhor o artigo. Isso é registrado no Portfólio Dinâmico.
5. De volta ao Labs, o usuário relê o artigo com mais confiança e identifica uma inconsistência metodológica ou uma sugestão relevante.
6. Ele submete sua primeira revisão, vinculada ao trecho específico do artigo onde identificou o ponto. A revisão é publicada com seu perfil de reputação atual (ainda baixo na área, mas visível).
7. O autor do artigo vê a revisão — mesmo que ela apareça mais abaixo no filtro padrão por reputação — e reconhece que a observação é válida. Ele marca a revisão como relevante.
8. O usuário ganha pontos de reputação na área temática do artigo. Sua contribuição aparece no Portfólio Dinâmico como "Revisão Relevante em [Área]".
9. Com o tempo, ele acumula reputação suficiente para ser convidado como colaborador de uma linha de pesquisa.

**Variations**: O usuário pode não completar as trilhas sugeridas e mesmo assim fazer uma revisão — o sistema não bloqueia, apenas informa o nível de reputação atual. A revisão pode ser ignorada pelo autor, mas permanece pública no histórico.

---

### Workflow 3: Pesquisador Conduz Experimento Interativo

**Actor**: Pesquisador Principal
**Goal**: Criar um experimento comportamental online, coletar dados de participantes e associar os resultados ao artigo em desenvolvimento
**Trigger**: A metodologia da linha de pesquisa prevê coleta de dados via experimento com participantes humanos
**Frequency**: Sob demanda
**Volume**: Pode envolver dezenas a centenas de participantes simultâneos

**Steps**:
1. Dentro da linha de pesquisa, o pesquisador cria um artefato do tipo `experiment`, descrevendo o design experimental (número de rodadas, variáveis, condições).
2. O sistema provisiona a execução do experimento na Cooperative Grid e gera um link público de participação.
3. O pesquisador configura o smart contract do experimento: quem pode participar (qualquer pessoa, apenas membros do ecossistema, etc.), se os dados são anônimos, por quanto tempo o experimento ficará ativo.
4. O pesquisador divulga o link (dentro do Labs, nas redes, por e-mail). Participantes acessam o link e executam o experimento no browser, sem precisar de conta no ecossistema (se o smart contract permitir acesso público).
5. Os dados coletados são automaticamente armazenados num dataset associado à linha de pesquisa.
6. Quando o experimento é encerrado, o pesquisador analisa os dados (que podem ser referenciados diretamente no artigo) e embute visualizações interativas dos resultados no corpo do artigo.

**Variations**: O experimento pode ser embebido diretamente no artigo publicado, permitindo que leitores repliquem o experimento após a publicação. Experimentos podem ter múltiplas condições e aleatorizar participantes entre elas automaticamente.

---

### Workflow 4: Translação de Pesquisa para Hub ou Learn

**Actor**: Pesquisador Principal / Diretor de Laboratório
**Goal**: Transformar os resultados de uma linha de pesquisa concluída em um projeto no Hub ou em uma trilha no Learn
**Trigger**: Linha de pesquisa concluída com resultados que têm aplicação prática ou potencial pedagógico
**Frequency**: Sob demanda (ao final de ciclos de pesquisa relevantes)
**Volume**: Individual ou em grupo

**Steps**:
1. O pesquisador marca a linha de pesquisa como concluída e acessa o menu de translação.
2. O sistema sugere projetos existentes no Hub que têm sobreposição temática, e trilhas no Learn que cobrem áreas relacionadas (para facilitar conexões em vez de criar duplicatas).
3. O pesquisador decide: criar um novo projeto no Hub, criar uma nova trilha no Learn, ou contribuir com projetos/trilhas existentes.
4. Se criar um novo projeto no Hub: o artigo e os artefatos relevantes são importados como referências; o pesquisador define a natureza do novo projeto (produto, serviço, ferramenta open source).
5. Se criar uma trilha no Learn: o conteúdo do artigo serve como base teórica; o pesquisador (ou um Creator do Learn) adapta o material para o formato pedagógico project-first.
6. Em ambos os casos, a origem do conteúdo (a linha de pesquisa no Labs) é registrada no Portfólio Dinâmico dos envolvidos.

**Variations**: A translação pode ser parcial — apenas alguns artefatos ou seções do artigo são aproveitados. Um projeto no Hub pode originar uma linha de pesquisa no Labs (fluxo inverso), se o desenvolvimento técnico levantar questões que merecem investigação científica formal.

---

## 9. Quality Priorities

1. **Confiabilidade** — O histórico científico (artigos, versões, revisões) não pode ser perdido ou corrompido. Imutabilidade das versões publicadas é inegociável.
2. **Abertura e transparência** — Todo o conteúdo público (artigos, revisões, histórico de versões) deve ser sempre acessível, sem restrições de paywall ou autenticação obrigatória.
3. **Integridade dos dados** — Datasets e experimentos precisam de proveniência rastreável. O Labs não pode ser uma plataforma onde dados são adulterados sem registro.
4. **Experiência do usuário** — O editor de artigos e o fluxo de revisão precisam ser prazerosos de usar. Um pesquisador que prefere continuar no Overleaf + e-mail representa uma falha de adoção.
5. **Escalabilidade** — O Labs precisa funcionar bem com poucos laboratórios no início e com milhares de artigos e revisores simultâneos no futuro.
6. **Performance** — A renderização de artigos em MyST/LaTeX e a execução de experimentos interativos precisam ser rápidas o suficiente para não quebrar o fluxo de trabalho.
7. **Segurança** — Dados de experimentos (especialmente com participantes humanos) e configurações de smart contracts precisam de proteção robusta.
8. **Extensibilidade** — Novos tipos de artefatos científicos e novos formatos de publicação devem poder ser adicionados sem reestruturar o sistema.
9. **Manutenibilidade** — O Labs reutiliza primitivas do ecossistema ao máximo; a complexidade adicional deve ser proporcional ao que é genuinamente específico do contexto científico.
10. **Observabilidade** — O sistema precisa produzir logs auditáveis de todas as ações relevantes (publicação, revisão, versionamento) para suportar a integridade científica.
11. **Custo** — A Cooperative Grid distribui o custo computacional; o Labs deve aproveitar isso para manter os custos de hospedagem de experimentos e artefatos baixos.
12. **Time to market** — O MVP deve ser funcional com os componentes essenciais; funcionalidades avançadas (experimentos interativos, indexação externa) podem ser post-MVP.

**Non-negotiable floors**: A imutabilidade de versões publicadas é absoluta — nenhuma versão publicada pode ser editada ou removida, independentemente de qualquer outra consideração. O histórico completo de revisões é público e permanente. Dados de participantes de experimentos humanos devem ser anonimizados conforme LGPD/GDPR antes de qualquer acesso ou exportação.

---

## 10. Constraints and Non-Goals

### Non-Goals (out of scope)

- O Labs não é um periódico acadêmico e não emite "aceite formal" de artigos como os periódicos tradicionais fazem. A validação é feita pela comunidade de revisores e pelo sistema de reputação, não por um comitê editorial.
- O Labs não gerencia financiamento de pesquisas (grants, bolsas) — essa funcionalidade, se necessária, pertence ao Hub ou a integrações externas.
- O Labs não substitui a infraestrutura de autenticação, reputação, portfólio ou notificações do ecossistema — ele os usa como serviços da Platform.
- O Labs não cria sua própria base de dados de citações bibliográficas — ele integra com padrões abertos existentes (DOI, OpenCitations) para referências externas.
- O Labs não oferece armazenamento ilimitado de datasets de grande escala como proposta de valor central — o foco é na integração e rastreabilidade, não no armazenamento bruto.

### Known Constraints

- O Labs depende das definições de Instituição, Projeto e Artefato estabelecidas na Platform. Mudanças nessas primitivas impactam diretamente o Labs.
- O sistema de smart contracts precisa suportar a tipagem de laboratório, linha de pesquisa e artefatos científicos — isso precisa estar previsto na especificação da Platform.
- A renderização de MyST e LaTeX depende de bibliotecas open source externas (MyST-Parser, KaTeX/MathJax); o Labs não constrói renderizadores próprios.
- A execução de experimentos interativos na Cooperative Grid depende da disponibilidade e capacidade da rede cooperativa — a escalabilidade dos experimentos está sujeita a essa infraestrutura.
- O projeto está em estágio inicial; o time de desenvolvimento é pequeno, o que impõe uma priorização rigorosa entre MVP e post-MVP.

### Assumptions

- Usuários do Labs têm acesso confiável à internet para escrever, publicar e revisar artigos.
- A Cooperative Grid terá capacidade computacional suficiente para hospedar experimentos interativos de escala moderada (dezenas a centenas de participantes simultâneos) no MVP.
- O sistema de reputação unificado da Platform estará disponível e maduro o suficiente para ser usado pelo Labs como serviço.
- MyST será o formato primário de artigos modernos na plataforma; LaTeX será suportado por compatibilidade com o fluxo de trabalho acadêmico tradicional.
- A geração de DOIs será feita via integração com DataCite ou CrossRef, sem necessidade de infraestrutura própria.

### Integration Requirements

| Sistema Externo | O que é | Propósito da Integração | Direção | Criticidade |
|-----------------|---------|------------------------|---------|-------------|
| Syntropy Platform (Instituições, Projetos, Artefatos) | Primitivas compartilhadas do ecossistema | O Labs opera sobre essas primitivas com tipagem específica; sem elas o Labs não existe | Inbound | Crítico |
| Syntropy Platform (Sistema de Reputação) | Sistema unificado de reputação do ecossistema | Cálculo e exibição de expertise de revisores por área temática | Inbound / Outbound | Crítico |
| Syntropy Platform (Portfólio Dinâmico) | Registro de trajetória do usuário | Publicação de eventos do Labs (artigo publicado, revisão feita, citação recebida) no portfólio | Outbound | Crítico |
| Syntropy Learn | Pilar de aprendizado do ecossistema | Sugestão de trilhas relevantes para leitores de artigos; translação de pesquisas em conteúdo educacional | Inbound / Outbound | Importante |
| Syntropy Hub | Pilar de criação do ecossistema | Translação de resultados de pesquisa em projetos; laboratórios visíveis como instituições no Hub | Inbound / Outbound | Importante |
| Cooperative Grid | Infraestrutura computacional distribuída do ecossistema | Hospedagem e execução de experimentos interativos | Inbound | Crítico (para experimentos) |
| DataCite / CrossRef | Provedores globais de DOIs | Registro e resolução de DOIs para artigos publicados | Outbound | Importante |
| OpenAlex / Google Scholar | Bases bibliográficas acadêmicas | Indexação de artigos publicados para descoberta externa | Outbound | Post-MVP |
| MyST-Parser (open source) | Renderizador do formato MyST | Renderização de artigos escritos em MyST | Inbound | Crítico |

### Data Sensitivity and Compliance

**Data types handled**:
- [x] Personal Identifiable Information (PII) — perfis de usuários, autoria de artigos
- [x] Authentication credentials — gerenciados pela Platform (não pelo Labs diretamente)
- [x] Proprietary / confidential business data — artigos e linhas de pesquisa privados

**Regulations that apply**:
- [x] GDPR (EU General Data Protection Regulation) — relevante para dados de participantes de experimentos e usuários europeus
- [x] LGPD (Lei Geral de Proteção de Dados — Brasil) — aplicável dado o contexto do projeto

Dados coletados em experimentos com participantes humanos devem ser anonimizados conforme as regulamentações aplicáveis antes de qualquer análise ou exportação. Artigos privados e linhas de pesquisa privadas devem ser inacessíveis a qualquer usuário fora do laboratório, independentemente de permissões de plataforma.

**Data residency requirements**: Sem restrições geográficas específicas no momento; pode ser revisado conforme parcerias institucionais.

### Scale and Team Context

**Team size**: Pequeno (2–5 desenvolvedores na fase inicial)

**Expected initial scale**: Comunidade inicial do ecossistema Syntropy (100–10.000 usuários); crescimento orgânico a partir do MVP

**Growth expectations**: Crescimento moderado a acelerado, dependente da adoção dos outros pilares (Learn e Hub); construído para escalar, mas sem otimização prematura

**Deployment target**: Cooperative Grid / Cloud (infraestrutura do ecossistema Syntropy)

---

## 11. Success Metrics

### Business Metrics

| Métrica | Descrição | Meta (12 meses pós-lançamento) | Como Medir |
|---------|-----------|-------------------------------|------------|
| Artigos publicados | Número de artigos com pelo menos uma versão publicada | 500 artigos | Contagem no banco de dados |
| Taxa de revisão | % de artigos publicados que receberam pelo menos uma revisão em 30 dias | > 60% | Contagem de revisões por artigo |
| Laboratórios ativos | Laboratórios com pelo menos uma linha de pesquisa ativa nos últimos 90 dias | 100 laboratórios | Contagem de atividade por laboratório |
| Revisores únicos | Número de usuários distintos que fizeram pelo menos uma revisão | 1.000 revisores | Contagem de revisores únicos |
| Iniciantes engajados | Usuários sem afiliação acadêmica formal que fizeram pelo menos uma contribuição (revisão ou colaboração) | 20% do total de revisores | Perfil de usuário + contagem de contribuições |
| Translações para Hub/Learn | Linhas de pesquisa concluídas que geraram projetos no Hub ou trilhas no Learn | 50 translações | Contagem de eventos de translação |

### Technical Metrics

| Métrica | Descrição | Meta | Como Medir |
|---------|-----------|------|------------|
| Tempo de renderização de artigos | Tempo para renderizar um artigo de tamanho médio (10 páginas, MyST) | < 2 segundos | Monitoramento de performance |
| Disponibilidade do serviço de publicação | Uptime do fluxo de publicação e revisão | > 99,5% | Monitoramento de uptime |
| Integridade do histórico de versões | % de versões publicadas com DOI válido e histórico completo | 100% | Auditoria automatizada |
| Latência de execução de experimentos | Tempo de carregamento de um experimento interativo para o participante | < 3 segundos | Monitoramento de performance da Cooperative Grid |

**Critério qualitativo**: Pesquisadores com experiência em plataformas como arXiv e Overleaf relatam que o Labs é pelo menos tão bom para escrita e publicação, com a vantagem da integração com revisão pública e artefatos interativos.

### Anti-Metrics

- Artigos publicados sem nenhuma revisão após 90 dias indicam falha no mecanismo de descoberta ou na comunidade de revisores — mesmo que o número absoluto de publicações seja alto.
- Alta concentração de revisões em poucos laboratórios ou áreas temáticas indica que a descoberta está falhando em distribuir atenção para pesquisas menos conhecidas.
- Revisores experientes (alta reputação) abandonando a plataforma por excesso de ruído (spam, revisões de baixa qualidade visíveis demais) indica que o filtro por reputação não está funcionando adequadamente.
- Pesquisadores preferindo exportar o artigo e publicar externamente (arXiv, periódicos) em vez de usar o Labs como plataforma primária indica que a proposta de valor de publicação integrada não está se realizando.
- Ausência de translações do Labs para Hub ou Learn após 12 meses indica que a integração cross-pilar é percebida como burocrática ou pouco útil — o ciclo de pesquisa → aplicação → aprendizado não está se fechando.

---

## 12. Inspirations and References

- **arXiv**: O modelo de preprints abertos e acesso livre é a referência mais importante para o princípio de abertura do Labs. O que o Labs adiciona é a camada interativa, o sistema de revisão estruturado e a integração com o ecossistema.
- **Overleaf**: A experiência de escrita colaborativa em LaTeX com renderização em tempo real é o benchmark de usabilidade para o editor de artigos do Labs. O Labs aspira a ser pelo menos tão bom quanto o Overleaf para escrita, com muito mais funcionalidade ao redor.
- **PubPeer**: A ideia de revisão pós-publicação vinculada a trechos específicos vem do PubPeer. O Labs generaliza esse modelo e o integra ao fluxo de publicação nativo.
- **oTree**: Framework Django para experimentos comportamentais online — a inspiração direta para o componente de experimentos interativos do Labs. O Labs aspira a ser uma plataforma onde experimentos do tipo oTree são cidadãos de primeira classe, criados e publicados junto com o artigo.
- **MyST Markdown (Executable Books Project)**: O formato de escrita científica que o Labs adota como padrão moderno. Permite combinar narrativa, código executável, figuras interativas e referências num único documento.
- **GitHub**: O modelo de versionamento (commits imutáveis, histórico público, diff entre versões) é a inspiração para o versionamento de artigos no Labs. Um artigo científico deve ter a mesma rastreabilidade que um repositório de código.
- **Semantic Scholar / OpenAlex**: Bases bibliográficas abertas que indexam artigos científicos com metadados ricos — o modelo de indexação externa com o qual o Labs deve ser interoperável.
- **Stack Overflow (sistema de reputação por área)**: A granularidade do sistema de reputação do Stack Overflow por tag (uma pessoa pode ter alta reputação em Python e baixa em Haskell) é a inspiração para o sistema de reputação científica por área temática no Labs.

**Interface character references**: O editor de artigos deve ter a qualidade de renderização do Overleaf com a fluidez de edição do Notion. A interface de descoberta deve ter a seriedade de uma base bibliográfica acadêmica com a navegabilidade de um feed de conteúdo curado. A interface de revisão deve ter a precisão do sistema de code review do GitHub.

---

## Next Steps

1. **Revisão com stakeholders**: Validar este documento com os demais documentos de visão do ecossistema (Platform, Hub, Learn) para garantir consistência nas definições de Instituição, Projeto e Artefato.
2. **Avaliar qualidade**: Usar Prompt 00 para obter avaliação de qualidade e sugestões de melhoria antes de prosseguir para arquitetura.
3. **Gerar arquitetura**: Usar Prompt 01 para transformar esta visão em arquitetura técnica — com atenção especial ao mapeamento de Laboratório → Instituição, Linha de Pesquisa → Projeto e Artefatos Científicos → Artefatos com tipagem específica.
4. **Iterar**: Usar Prompt 02 para refinar a arquitetura, especialmente nos componentes de Revisão por Pares Aberta e Experimentos Interativos, que são os domínios core do Labs.

Ver `.cursor/FRAMEWORK.md` para o guia completo do workflow.