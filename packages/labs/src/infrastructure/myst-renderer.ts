/**
 * MystRenderer — MyST Markdown to HTML (COMP-023.3).
 * Architecture: article-editor.md, ADR-008
 */

import { mystParser } from "myst-parser";
import { State, transform, mystToHast, formatHtml } from "myst-to-html";
import rehypeStringify from "rehype-stringify";
import { unified } from "unified";

/**
 * Renders MyST Markdown to HTML. Supports headings, citations, figures,
 * equations, admonitions, and inline math. Uses myst-parser and myst-to-html.
 */
export class MystRenderer {
  private readonly pipeline = unified()
    .use(mystParser)
    .use(transform, new State())
    .use(mystToHast)
    .use(formatHtml)
    .use(rehypeStringify);

  /**
   * Renders MyST markdown to an HTML string.
   * Synchronous; suitable for server-side or tests.
   */
  render(mystMarkdown: string): string {
    if (typeof mystMarkdown !== "string") {
      throw new Error("mystMarkdown must be a string");
    }
    const file = this.pipeline.processSync(mystMarkdown);
    return String(file.value);
  }
}
