import type { Metadata } from "next";
import { findDoc } from "@/content/docs";
import { DocView } from "./doc-view";

const page = findDoc("introduction")!;

export const metadata: Metadata = {
  title: "Docs",
  description: page.description,
  alternates: { canonical: "/docs" },
};

export default function DocsHome() {
  return <DocView page={page} />;
}
