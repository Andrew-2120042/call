"use client";

import process from "node:process";
import { CALCOM_VERSION, COMPANY_NAME } from "@calcom/lib/constants";
import { useEffect, useState } from "react";

// eslint-disable-next-line turbo/no-undeclared-env-vars
const vercelCommitHash = process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA;

export function getVersionLabel(version: string | undefined, commitSha: string | undefined): string | null {
  if (!version) return null;
  const commit = commitSha ? `-${commitSha.slice(0, 7)}` : "";
  return `v${version}${commit}`;
}

export default function Credits() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // The version is only known on the client after mount, so render it then to avoid a hydration mismatch.
  const versionLabel = hasMounted ? getVersionLabel(CALCOM_VERSION, vercelCommitHash) : null;

  return (
    <small className="text-default mx-3 mb-2 mt-1 hidden text-[0.5rem] opacity-50 lg:block">
      &copy; {new Date().getFullYear()} {COMPANY_NAME}
      {versionLabel && <span> {versionLabel}</span>}
    </small>
  );
}
