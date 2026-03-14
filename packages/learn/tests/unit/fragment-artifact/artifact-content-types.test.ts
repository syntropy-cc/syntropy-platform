/**
 * Unit tests for artifact content types (COMP-016.2).
 */

import { describe, it, expect } from "vitest";
import {
  CodeArtifact,
  QuizArtifact,
  TextArtifact,
  VideoArtifact,
} from "../../../src/domain/fragment-artifact/artifact-content-types.js";

describe("VideoArtifact", () => {
  it("create accepts valid url and optional duration and title", () => {
    const v = VideoArtifact.create({
      url: "https://example.com/video.mp4",
      durationSeconds: 120,
      title: "Intro",
    });
    expect(v.url).toBe("https://example.com/video.mp4");
    expect(v.durationSeconds).toBe(120);
    expect(v.title).toBe("Intro");
  });

  it("validate throws when url is empty", () => {
    const v = new (VideoArtifact as unknown as { create: (p: unknown) => VideoArtifact })(
      {} as never
    );
    // Use create which calls validate
    expect(() =>
      VideoArtifact.create({ url: "" })
    ).toThrow("VideoArtifact: url is required");
  });

  it("validate throws when url is invalid", () => {
    expect(() =>
      VideoArtifact.create({ url: "not-a-url" })
    ).toThrow("VideoArtifact: invalid url");
  });

  it("validate throws when durationSeconds is negative", () => {
    expect(() =>
      VideoArtifact.create({
        url: "https://example.com/v.mp4",
        durationSeconds: -1,
      })
    ).toThrow("durationSeconds must be a non-negative number");
  });
});

describe("TextArtifact", () => {
  it("create accepts body and optional format", () => {
    const t = TextArtifact.create({ body: "Hello world", format: "markdown" });
    expect(t.body).toBe("Hello world");
    expect(t.format).toBe("markdown");
  });

  it("validate throws when body is empty", () => {
    expect(() => TextArtifact.create({ body: "   " })).toThrow(
      "TextArtifact: body cannot be empty"
    );
  });

  it("validate throws when format is invalid", () => {
    expect(() =>
      TextArtifact.create({
        body: "Content",
        format: "invalid" as "plain",
      })
    ).toThrow("format must be one of");
  });
});

describe("CodeArtifact", () => {
  it("create accepts language and code", () => {
    const c = CodeArtifact.create({
      language: "typescript",
      code: "const x = 1;",
      snippet: "x",
    });
    expect(c.language).toBe("typescript");
    expect(c.code).toBe("const x = 1;");
    expect(c.snippet).toBe("x");
  });

  it("validate throws when language is empty", () => {
    expect(() =>
      CodeArtifact.create({ language: "", code: "const x = 1;" })
    ).toThrow("CodeArtifact: language is required");
  });

  it("validate throws when code is empty", () => {
    expect(() =>
      CodeArtifact.create({ language: "ts", code: "" })
    ).toThrow("CodeArtifact: code cannot be empty");
  });
});

describe("QuizArtifact", () => {
  it("create accepts valid questions", () => {
    const q = QuizArtifact.create({
      questions: [
        {
          id: "q1",
          question: "What is 2+2?",
          options: ["3", "4", "5"],
          correctIndex: 1,
        },
      ],
    });
    expect(q.questions).toHaveLength(1);
    expect(q.questions[0].correctIndex).toBe(1);
  });

  it("validate throws when questions array is empty", () => {
    expect(() => QuizArtifact.create({ questions: [] })).toThrow(
      "QuizArtifact: at least one question is required"
    );
  });

  it("validate throws when question has invalid correctIndex", () => {
    expect(() =>
      QuizArtifact.create({
        questions: [
          {
            id: "q1",
            question: "Q?",
            options: ["A", "B"],
            correctIndex: 5,
          },
        ],
      })
    ).toThrow("correctIndex must be in range");
  });

  it("validate throws when question has fewer than 2 options", () => {
    expect(() =>
      QuizArtifact.create({
        questions: [
          {
            id: "q1",
            question: "Q?",
            options: ["A"],
            correctIndex: 0,
          },
        ],
      })
    ).toThrow("at least 2 options");
  });
});
