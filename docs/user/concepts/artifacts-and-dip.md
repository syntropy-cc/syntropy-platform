# Artifacts and the DIP

## What is an artifact?

An **artifact** is any digital output that the platform treats as a first-class, ownable unit: code, a document, a dataset, a scientific article, or a composite of other artifacts. In the Syntropy Platform, every such output is an **DIP artifact** — it has a unique ID, an author, a lifecycle (draft → submitted → published), and (once published) a **cryptographic identity record** that anchors who created it and the content hash to an immutable ledger (e.g. Nostr). That makes authorship and integrity verifiable without relying on the platform alone.

## How artifacts and the DIP work

The **Digital Institutions Protocol (DIP)** is the layer that defines how artifacts exist and interact:

1. **Creation** — You create a draft artifact (via the API or the IDE). The platform assigns an author (you) and an ID.
2. **Submit** — You move the artifact to a “submitted” state so it is ready for publication.
3. **Publish** — The platform publishes the artifact and creates an **identity record**: author public key, content hash, timestamp, and signature. This record is anchored to an external immutable log (Nostr). Once anchored, that version of the artifact cannot be changed.
4. **Usage** — Other systems (e.g. Hub contributions, project manifests, Labs articles) reference the artifact by ID. The **IACP** (Inter-Artifact Communication Protocol) governs how artifacts can depend on or use each other and how the **dependency graph** is built.

```mermaid
flowchart LR
  A[Draft] --> B[Submitted]
  B --> C[Published]
  C --> D[Identity Record Anchored]
```

## Key principles

- **Immutability** — A published artifact version is immutable. New versions are new artifacts or new version records, not edits to the old one.
- **Single source of truth** — DIP owns artifact identity and lifecycle. Learn, Hub, and Labs reference artifacts by ID; they do not duplicate ownership.
- **Verifiable authorship** — The identity record ties the artifact to the creator’s public key and content hash so anyone can verify who created it and that the content matches.

## Artifacts in practice

When you complete a Learn fragment and “publish” your work, the platform creates (or links) a DIP artifact and publishes it. When you submit a contribution in the Hub, you attach a **published** artifact to the issue. In Labs, a scientific article is an artifact of type `scientific-article`; publishing it creates an immutable version and can trigger DOI registration. In all cases, the same DIP model applies: create → submit → publish → anchor.

## Related concepts

- **[Portfolio and Events](portfolio-and-events.md)** — Publishing and using artifacts emit events that drive your portfolio.
- **[Institutions and Governance](institutions-and-governance.md)** — Projects and institutions hold artifact manifests and govern how artifacts are used and how value flows.
- **[Labs: Research and Review](labs-research-and-review.md)** — Articles and datasets are artifacts with a scientific workflow on top.

## See Also

- [Artifacts API](../reference/api/artifacts.md)
- [How to create an artifact](../how-to/create-artifact.md)
- [IACP API](../reference/api/iacp.md)
