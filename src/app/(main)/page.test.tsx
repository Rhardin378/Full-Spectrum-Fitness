import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/image", () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));

vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

import Home from "./page";

describe("landing page", () => {
  it("promises early access instead of free forever", () => {
    render(<Home />);

    const text = document.body.textContent ?? "";
    expect(text).not.toContain("Free Forever");
    expect(text).toContain("Free during early access");
  });
});
