# Tutorial: Publish a Labs Article

> **What you'll learn**: Create a laboratory, write a scientific article in MyST/LaTeX, publish it (with DOI), and receive and respond to peer reviews.
>
> **Prerequisites**: Signed-in user; optional: basic familiarity with MyST or LaTeX.
>
> **Time**: ~40 minutes

## Overview

In Labs, you run the full research cycle: create a **laboratory** (institution type), start a **research line**, write an **article** in the integrated editor, **publish** it (which makes it public and can trigger DOI registration), and handle **reviews** from the community. This tutorial walks that path once.

## Before You Begin

- [ ] You are signed in
- [ ] You have access to Labs (e.g. `https://app.syntropy.cc/labs` or your instance)

## Step 1: Create a laboratory (if needed)

If you don’t have a laboratory yet, create one: **New laboratory** (or equivalent). Set name, research area(s), and visibility. The laboratory is a digital institution with type `laboratory` and its own governance contract.

**Result**: You have a laboratory where you can create research lines and articles.

## Step 2: Create a research line

Inside the laboratory, create a **Research line**. Set:

- **Title** and hypothesis or research question
- **Methodology** (brief)
- **Subject area** (for discovery and reviewer matching)

**Result**: The research line is the container for your article and related artifacts (datasets, experiments).

## Step 3: Create and write the article

Create a new **Article** in the research line. The editor supports **MyST Markdown** and **LaTeX**. Write:

- Title and authors
- Abstract
- Sections (introduction, methods, results, discussion, etc.)
- References and any embedded artifacts (figures, data, code)

Use the live preview to check rendering. Save as draft as you go.

**Result**: You have a draft article with full content.

## Step 4: Publish the article

When the article is ready, use **Publish** (or **Submit for publication**). Confirm:

- You have marked human approval if the system requires it (e.g. for AI-assisted content).
- Publication is irreversible for this version.

The system publishes the article, may register a **DOI** (DataCite/CrossRef), and opens it to **peer review**. The new version is permanent.

**Result**: The article is public; others can read it and submit reviews.

## Step 5: View and respond to reviews

Reviewers can submit **reviews** linked to specific passages. You see them in the article’s review list, possibly filtered by reputation.

Read the reviews, **respond** where the UI allows (e.g. author response), and optionally **publish a new version** that incorporates feedback. Each version is immutable and can have its own DOI.

**Result**: You have completed one full cycle: draft → publish → receive reviews → respond (and optionally publish a new version).

## What You've Learned

- You created a laboratory and a research line.
- You wrote an article in MyST/LaTeX and published it (with optional DOI).
- You saw how open peer review works (passage-linked reviews, reputation, and versioning).

## Next Steps

- [How to submit a Labs review](../how-to/submit-review-labs.md)
- [Labs: Research and Review](../concepts/labs-research-and-review.md)
- [Labs API](../reference/api/labs.md)

## See Also

- [Contribute to a Hub Project](04-contribute-to-hub-project.md)
- [Institutions and Governance](../concepts/institutions-and-governance.md)
- [Artifacts and the DIP](../concepts/artifacts-and-dip.md)
