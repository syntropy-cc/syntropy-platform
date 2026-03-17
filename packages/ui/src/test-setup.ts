import "@testing-library/jest-dom/vitest";

// jsdom does not implement scrollIntoView; Radix Select calls it when content opens
if (
  typeof Element !== "undefined" &&
  typeof Element.prototype.scrollIntoView !== "function"
) {
  Element.prototype.scrollIntoView = () => {};
}
