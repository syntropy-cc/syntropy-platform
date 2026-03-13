# ADR-008: Scientific Writing Format — MyST Markdown + LaTeX with MyST-Parser

## Status

Accepted

## Date

2026-03-12

## Context

Syntropy Labs' Article Editor domain requires a writing format that satisfies the scientific publishing community's requirements while being usable in a modern web-based editor. The Labs Article Editor (Core Domain) provides the writing interface for scientific articles that will ultimately be published to DOI registries (DataCite/CrossRef via ADR) and referenced as DIP Artifacts.

Scientific writing has specific requirements that general-purpose markdown does not address:

1. **Mathematical notation**: Researchers require LaTeX math (both inline `$...$` and display-mode `$$...$$`) for equations, formulas, and proofs
2. **Cross-referencing**: Figures, tables, equations, sections, and citations must be cross-referenced with automatic numbering (Figure 1, Equation 3, etc.)
3. **Citations and bibliography**: Standard citation formats (APA, AMA, Vancouver, etc.) with proper bibliography generation; DOI-linked references
4. **Structured document elements**: Abstract, keywords, author affiliations, acknowledgments — these are required metadata for journal-compatible output
5. **Executable components**: Syntropy Labs' experiment-linked articles must support executable code cells (Python, R) whose outputs (figures, tables) are embedded in the article — this is the "executable science" differentiator
6. **Multiple export formats**: Articles must be exportable as PDF (for submission), HTML (for web publication), and JATS XML (for journal submission systems)
7. **EmbeddedArtifact references**: Articles reference DIP Artifacts (datasets, code packages, supplementary materials) by ID — the format must support this reference type as a first-class element

The Labs Article Editor is a **Core Domain subdomain** — the writing experience and its integration with DIP artifact referencing is a differentiating feature. However, the document format itself should be an adopted standard, not a proprietary DSL.

**Existing standards in the scientific writing space**:
- **LaTeX**: the gold standard for academic publishing; full math support; complex syntax; steep learning curve; not web-native
- **MyST Markdown** (Mystical Structured Text): a superset of CommonMark Markdown with rich directives for scientific content; executes with Jupyter; cross-references, citations, math — all supported; parseable to standard document ASTs
- **Quarto**: a scientific publishing system built on Pandoc + Knitr/Jupyter; supports R, Python, Julia; produces HTML/PDF/Word output
- **AsciiDoc**: a rich markup language with scientific extensions; less common in academic circles; fewer tools

## Decision

We will use **MyST Markdown** as the primary document format for Labs articles, with **LaTeX math** (KaTeX rendering in the browser, pdflatex/XeTeX for PDF export), rendered and validated by the **MyST-Parser** open-source library (`mystmd` / `myst-parser`). Executable components (code cells producing figures or tables) render via **isolated IDE containers** (IDE domain, ADR-007).

Specifically:

1. **Document format**: MyST Markdown (`.myst.md` files). Articles are structured MyST documents with:
   - Standard CommonMark markdown for prose
   - LaTeX math blocks (`$...$` inline, `$$...$$` display)
   - MyST directives for figures (`{figure}`), tables, admonitions, cross-references (`{ref}`, `{numref}`), citations (`{cite}`), and author metadata (`{article}` front matter)
   - Custom directives for Syntropy-specific elements: `{syntropy:artifact}` for EmbeddedArtifact references (DIP Artifact IDs inline in article)

2. **Real-time rendering**: The Article Editor uses **KaTeX** (via `katex` npm package) for browser-side math rendering — fast, no server round-trip. Non-math MyST directives render via a `myst-parser` WebAssembly build running in a Web Worker.

3. **PDF export**: Triggered by the Labs domain; delegates to a background service (background-services worker) that runs `mystmd build --pdf` using `pdflatex` or `xelatex` in an isolated container. The PDF artifact is stored in Supabase Storage and linked as a DIP Artifact subtype.

4. **HTML export**: `mystmd build --html` produces static HTML suitable for web publication. Used for the article's public page on the Institutional Site.

5. **JATS XML export**: `mystmd build --jats` produces Journal Article Tag Suite XML for journal submission workflows. Required for DOI registration with DataCite (ADR for DOI).

6. **Executable components**: A MyST code cell (` ```{code-cell} python`) triggers the IDE domain's container execution service (same container infrastructure, ADR-007). The cell output (figure, dataframe, computed value) is captured and embedded as a static asset in the article at the time of export. Live re-execution is available in the editor but the published version uses captured outputs.

7. **`{syntropy:artifact}` directive**: A custom MyST directive that resolves a DIP Artifact ID to its metadata (title, version, DOI if registered) and renders it as a formatted citation with a platform link. This directive is processed by a custom MyST plugin in `packages/labs/infrastructure/myst-plugins/`.

8. **Immutable versioning**: Each saved version of an article is a complete immutable snapshot of the MyST source. Previous versions are never deleted. Publication commits a specific version as the canonical representation.

## Alternatives Considered

### Alternative 1: Quarto

Quarto is a scientific publishing system built on Pandoc. It supports R, Python, Julia, and Observable JavaScript; produces HTML, PDF, Word, and EPUB output.

**Pros**:
- Strong ecosystem adoption in the R and Python data science communities
- Excellent multi-language support (R, Python, Julia in the same document)
- Built on Pandoc — battle-tested document conversion
- Native integration with Jupyter notebooks

**Cons**:
- Quarto is a full rendering pipeline that runs as a command-line tool — not designed for interactive web editing. Embedding Quarto's live preview in a browser editor requires server-side rendering on every keystroke — latency is unacceptable for a real-time editing experience
- Quarto's rendering pipeline includes R and Julia runtimes; supporting all of them requires complex container images
- Quarto documents use `.qmd` (Quarto Markdown) — a Quarto-specific format with no AST representation suitable for browser-side parsing
- Custom directives (EmbeddedArtifact references) require Quarto extension development — complex, poorly documented for production use

**Why rejected**: The lack of a browser-parseable AST representation makes real-time in-browser rendering impractical. MyST Markdown's WebAssembly-compatible parser enables in-browser live preview without server round-trips — a critical UX requirement for the Article Editor.

### Alternative 2: Overleaf Integration (LaTeX-Based)

Integrate with Overleaf's API to provide LaTeX editing with Overleaf's compilation infrastructure.

**Pros**:
- LaTeX is the gold standard in physics, mathematics, and many engineering fields
- Overleaf provides a well-understood editing environment familiar to many researchers
- Direct integration with journal submission systems

**Cons**:
- External service dependency — Overleaf is a closed-source commercial product; self-hosting is not available in the standard offering
- Redirecting users to an external editor breaks the Syntropy platform's unified experience (Vision mandate: no context switch to external tools)
- No native support for EmbeddedArtifact references or DIP integration
- LaTeX's verbosity makes it unsuitable for mixed prose/math writing that is the dominant style for Syntropy Labs articles
- Requires Overleaf API key and per-user subscription costs

**Why rejected**: External service dependency contradicts self-hosting requirements. Breaking the platform's unified experience is a direct violation of the Vision's cross-pillar continuity principle. LaTeX-only editing lacks the prose + interactive elements support that MyST provides.

### Alternative 3: Custom DSL (Proprietary Markup Language)

Design a Syntropy-specific document format optimized for the platform's needs.

**Pros**:
- Complete control over syntax and semantics
- No format constraints from external specifications
- Can be designed to natively express DIP artifact references

**Cons**:
- Researchers expect standard formats; a proprietary DSL creates lock-in that contradicts the ecosystem's open principles
- Articles must be exportable to standard formats (PDF, JATS XML) — a custom DSL requires a complete standard-format converter, which is enormous work
- No existing tooling, parser libraries, or editor plugins — everything must be built from scratch
- Researchers cannot use their existing writing tools (Zotero, citation managers) with a custom format

**Why rejected**: Creating a proprietary scientific writing format is a massive undertaking that provides no advantage over adopting an existing standard. MyST Markdown's extension mechanism provides the customization capability needed for `{syntropy:artifact}` directives without building an entire format from scratch.

### Alternative 4: Plain LaTeX (Without MyST)

Use raw LaTeX as the article format, with a LaTeX editor widget in the browser.

**Pros**:
- Maximum fidelity for complex mathematical notation
- Universal acceptance in academic publishing
- Direct PDF output via standard LaTeX toolchain

**Cons**:
- LaTeX is not parseable in the browser — live preview requires server-side compilation on every keystroke (latency: 1–5 seconds per save)
- LaTeX syntax is hostile to non-expert users; the majority of researchers who are not physicists or mathematicians find it difficult
- No structured semantic elements for abstract, keywords, author affiliations — these must be managed with LaTeX environments, which are not standardized
- Executable code cells are not a native LaTeX feature — require separate `.tex` + Jupyter pipeline coordination

**Why rejected**: Server-side compilation latency breaks the real-time editing experience. LaTeX's user hostility excludes the non-expert researcher segment. MyST Markdown provides LaTeX math where needed while remaining accessible to researchers across disciplines.

## Consequences

### Positive

- MyST Markdown is an established open standard in the scientific publishing community (Project Jupyter ecosystem, Executable Books project). Researchers who already know Markdown can adopt it with minimal learning curve.
- The `mystmd` library's WebAssembly build enables in-browser parsing and live preview — the Article Editor renders changes in real time without server round-trips.
- The `{syntropy:artifact}` custom directive natively integrates DIP artifact references into the article authoring workflow — researchers cite their own datasets and code packages as first-class references, not as footnote URLs.
- PDF, HTML, and JATS XML export from a single source format ensures articles look correct across all publication venues.

### Negative

- MyST Markdown is less widely known than LaTeX in physics and mathematics departments; some researchers may resist the format change.
  - **Mitigation**: The Article Editor includes a LaTeX-to-MyST import tool that converts `.tex` files to MyST format. Pure LaTeX math blocks work identically in both formats. The migration guide emphasizes that MyST is a superset of what they already know.
- The `mystmd` WebAssembly build is a relatively new artifact; browser compatibility and performance characteristics on older hardware require testing.
  - **Mitigation**: Fall back to server-side rendering (background service worker) for complex documents exceeding a configurable complexity threshold. Monitor render latency as a standard metric.
- Executable component rendering via IDE containers (ADR-007) adds latency for articles with many code cells.
  - **Mitigation**: Code cell outputs are cached at the article version level. Re-execution is only triggered when the user explicitly requests it. Published versions use statically captured outputs — zero runtime cost for readers.

### Neutral

- The decision to use MyST as the canonical format means article content is stored as plain text (`.myst.md` source) in the Labs domain's database. This is consistent with the ecosystem's "source is truth" philosophy.
- Each published article version stores both the MyST source and the compiled HTML/PDF artifacts in Supabase Storage. The source is canonical; compiled artifacts are derived and can be regenerated.

## References

- Vision Document: Section 33–40 (Labs capabilities: article editor, executable science)
- `docs/architecture/domains/labs/subdomains/article-editor.md` — Article Editor subdomain design
- `docs/architecture/domains/labs/subdomains/doi-external-publication.md` — JATS XML export for DOI registration
- ADR-007: IDE Embedding — executable component container execution
- MyST Markdown specification: https://mystmd.org
- MyST-Parser (Python): https://myst-parser.readthedocs.io
- mystmd (JavaScript/WebAssembly): https://github.com/executablebooks/mystmd

## Derived Rules

- `architecture.mdc`: ARCH-011 — Labs Article Editor is a Core Domain subdomain; MyST Markdown is an adopted open standard (not a Generic Subdomain — the integration with DIP and executable components is custom)

---

## Review History

| Date | Reviewer | Decision | Notes |
|------|----------|----------|-------|
| 2026-03-12 | System Architect | Accepted | MyST Markdown provides real-time browser rendering, LaTeX math support, executable components, and standard export formats — satisfying all scientific publishing requirements |
