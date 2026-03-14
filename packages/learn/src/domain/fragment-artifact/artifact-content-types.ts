/**
 * Artifact content type value objects (COMP-016.2).
 * Architecture: fragment-artifact-engine.md.
 */

export type ArtifactContentKind = "video" | "text" | "code" | "quiz";

/** Video artifact: URL and optional duration in seconds. */
export interface VideoArtifactParams {
  url: string;
  durationSeconds?: number;
  title?: string;
}

export class VideoArtifact {
  readonly url: string;
  readonly durationSeconds: number | null;
  readonly title: string;

  private constructor(params: VideoArtifactParams) {
    this.url = params.url;
    this.durationSeconds = params.durationSeconds ?? null;
    this.title = params.title ?? "";
  }

  static create(params: VideoArtifactParams): VideoArtifact {
    const v = new VideoArtifact(params);
    v.validate();
    return v;
  }

  validate(): void {
    const t = this.url?.trim();
    if (!t) throw new Error("VideoArtifact: url is required");
    try {
      new URL(this.url);
    } catch {
      throw new Error(`VideoArtifact: invalid url "${this.url}"`);
    }
    if (
      this.durationSeconds != null &&
      (typeof this.durationSeconds !== "number" || this.durationSeconds < 0)
    ) {
      throw new Error(
        "VideoArtifact: durationSeconds must be a non-negative number"
      );
    }
  }
}

/** Text artifact: body and optional format. */
export interface TextArtifactParams {
  body: string;
  format?: "plain" | "markdown" | "html";
}

export class TextArtifact {
  readonly body: string;
  readonly format: "plain" | "markdown" | "html";

  private constructor(params: TextArtifactParams) {
    this.body = params.body ?? "";
    this.format = params.format ?? "plain";
  }

  static create(params: TextArtifactParams): TextArtifact {
    const t = new TextArtifact(params);
    t.validate();
    return t;
  }

  validate(): void {
    if (this.body.trim().length === 0) {
      throw new Error("TextArtifact: body cannot be empty");
    }
    const allowed: Array<"plain" | "markdown" | "html"> = [
      "plain",
      "markdown",
      "html",
    ];
    if (!allowed.includes(this.format)) {
      throw new Error(
        `TextArtifact: format must be one of ${allowed.join(", ")}`
      );
    }
  }
}

/** Code artifact: language, code snippet. */
export interface CodeArtifactParams {
  language: string;
  code: string;
  snippet?: string;
}

export class CodeArtifact {
  readonly language: string;
  readonly code: string;
  readonly snippet: string;

  private constructor(params: CodeArtifactParams) {
    this.language = params.language ?? "";
    this.code = params.code ?? "";
    this.snippet = params.snippet ?? "";
  }

  static create(params: CodeArtifactParams): CodeArtifact {
    const c = new CodeArtifact(params);
    c.validate();
    return c;
  }

  validate(): void {
    if (this.language.trim().length === 0) {
      throw new Error("CodeArtifact: language is required");
    }
    if (this.code.trim().length === 0) {
      throw new Error("CodeArtifact: code cannot be empty");
    }
  }
}

/** Quiz artifact: questions and correct answers. */
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface QuizArtifactParams {
  questions: QuizQuestion[];
}

export class QuizArtifact {
  readonly questions: readonly QuizQuestion[];

  private constructor(params: QuizArtifactParams) {
    this.questions = [...(params.questions ?? [])];
  }

  static create(params: QuizArtifactParams): QuizArtifact {
    const q = new QuizArtifact(params);
    q.validate();
    return q;
  }

  validate(): void {
    if (this.questions.length === 0) {
      throw new Error("QuizArtifact: at least one question is required");
    }
    for (let i = 0; i < this.questions.length; i++) {
      const q = this.questions[i];
      if (!q.id?.trim()) {
        throw new Error(`QuizArtifact: question ${i} id is required`);
      }
      if (!q.question?.trim()) {
        throw new Error(`QuizArtifact: question ${i} question text is required`);
      }
      if (!Array.isArray(q.options) || q.options.length < 2) {
        throw new Error(
          `QuizArtifact: question ${i} must have at least 2 options`
        );
      }
      if (
        typeof q.correctIndex !== "number" ||
        q.correctIndex < 0 ||
        q.correctIndex >= q.options.length
      ) {
        throw new Error(
          `QuizArtifact: question ${i} correctIndex must be in range [0, ${q.options.length})`
        );
      }
    }
  }
}
