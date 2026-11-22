import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import Credits, { getVersionLabel } from "./Credits";

vi.mock("@calcom/lib/constants", async () => {
  const actual = (await vi.importActual("@calcom/lib/constants")) as typeof import("@calcom/lib/constants");
  return {
    ...actual,
    COMPANY_NAME: "Calbee",
    CALCOM_VERSION: "5.1.0",
  };
});

describe("Credits", () => {
  test("renders the copyright with the company name and no external links", () => {
    render(<Credits />);

    const currentYear = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`© ${currentYear} Calbee`))).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  test("renders the version after mount", () => {
    render(<Credits />);

    expect(screen.getByText("v5.1.0")).toBeInTheDocument();
  });
});

describe("getVersionLabel", () => {
  test("returns null when the version is unknown instead of printing undefined", () => {
    expect(getVersionLabel(undefined, undefined)).toBeNull();
  });

  test("appends a short commit hash when one is available", () => {
    expect(getVersionLabel("5.1.0", "abcdef1234567")).toBe("v5.1.0-abcdef1");
  });
});
