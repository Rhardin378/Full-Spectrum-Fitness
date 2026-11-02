import "@testing-library/jest-dom/vitest";

// Measurements history loads inside requestAnimationFrame; run callbacks immediately in tests.
if (typeof globalThis.requestAnimationFrame === "function") {
  globalThis.requestAnimationFrame = ((callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  }) as typeof globalThis.requestAnimationFrame;
}
