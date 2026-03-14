/**
 * FragmentSection — one of Problem, Theory, or Artifact (COMP-016.1).
 * Architecture: fragment-artifact-engine.md.
 */

export type FragmentSectionType = "problem" | "theory" | "artifact";

export interface FragmentSectionParams {
  sectionType: FragmentSectionType;
  content: string;
}

/**
 * Section within a Fragment aggregate. Completeness is derived from non-empty content.
 */
export class FragmentSection {
  readonly sectionType: FragmentSectionType;
  private _content: string;

  private constructor(params: FragmentSectionParams) {
    this.sectionType = params.sectionType;
    this._content = params.content ?? "";
  }

  static create(params: FragmentSectionParams): FragmentSection {
    return new FragmentSection(params);
  }

  get content(): string {
    return this._content;
  }

  get isComplete(): boolean {
    return this._content.trim().length > 0;
  }

  setContent(content: string): void {
    this._content = content ?? "";
  }

  markComplete(content: string): void {
    if (content.trim().length === 0) {
      throw new Error(
        `FragmentSection ${this.sectionType}: content must be non-empty to mark complete`
      );
    }
    this._content = content;
  }
}
