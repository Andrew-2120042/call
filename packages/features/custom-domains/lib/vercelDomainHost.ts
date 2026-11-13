import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import type { IDomainHost } from "../services/CustomDomainService";

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/** Adds/removes the domain on the Vercel project so Vercel serves it and issues its TLS certificate. */
export function createVercelDomainHost(opts: {
  token: string;
  projectId: string;
  teamId?: string;
  fetchImpl?: FetchLike;
}): IDomainHost {
  const doFetch = opts.fetchImpl ?? fetch;
  const query = opts.teamId ? `?teamId=${encodeURIComponent(opts.teamId)}` : "";
  const project = encodeURIComponent(opts.projectId);
  const headers = { authorization: `Bearer ${opts.token}`, "content-type": "application/json" };

  return {
    async addDomain(domain) {
      const res = await doFetch(`https://api.vercel.com/v10/projects/${project}/domains${query}`, {
        method: "POST",
        headers,
        body: JSON.stringify({ name: domain }),
      });
      if (res.ok) return;
      const body = (await res.json().catch(() => ({}))) as { error?: { code?: string; message?: string } };
      // Re-adding a domain this project already has is fine.
      if (body.error?.code === "domain_already_exists") return;
      throw new ErrorWithCode(
        ErrorCode.BadRequest,
        `Couldn't connect the domain: ${body.error?.message ?? `hosting provider returned ${res.status}`}`
      );
    },
    async removeDomain(domain) {
      const res = await doFetch(
        `https://api.vercel.com/v9/projects/${project}/domains/${encodeURIComponent(domain)}${query}`,
        { method: "DELETE", headers }
      );
      if (!res.ok && res.status !== 404) {
        throw new ErrorWithCode(
          ErrorCode.InternalServerError,
          `Removing ${domain} failed with ${res.status}`
        );
      }
    },
  };
}
