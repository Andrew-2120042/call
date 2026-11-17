import { randomBytes } from "node:crypto";
import { ErrorCode } from "@calcom/lib/errorCodes";
import { ErrorWithCode } from "@calcom/lib/errors";
import { normalizeDomain } from "../lib/normalizeDomain";
import type { StoredCustomDomain } from "../repositories/CustomDomainRepository";

export const VERIFICATION_RECORD_PREFIX = "_nodslot-verify";

export interface ICustomDomainRepository {
  findByUserId(userId: number): Promise<StoredCustomDomain | null>;
  findByDomainIncludeUsername(
    domain: string
  ): Promise<(StoredCustomDomain & { user: { username: string | null } }) | null>;
  isDomainTaken(domain: string, exceptUserId: number): Promise<boolean>;
  upsertForUser(data: { userId: number; domain: string; verificationToken: string }): Promise<void>;
  markChecked(userId: number, verifiedAt: Date | null, checkedAt: Date): Promise<void>;
  deleteForUser(userId: number): Promise<void>;
}

export interface IDnsResolver {
  resolveTxt(hostname: string): Promise<string[][]>;
  resolveCname(hostname: string): Promise<string[]>;
}

/** Hosting provider hook (Vercel today) so the app's TLS certificate covers the new domain. */
export interface IDomainHost {
  addDomain(domain: string): Promise<void>;
  removeDomain(domain: string): Promise<void>;
}

export interface ICustomDomainServiceDeps {
  repository: ICustomDomainRepository;
  dns: IDnsResolver;
  host: IDomainHost | null;
  isEntitled: (userId: number) => Promise<boolean>;
  /** Hostnames the app itself is served on; they can never be claimed. */
  reservedHosts: string[];
  cnameTarget: string | null;
  now?: () => Date;
}

export type CustomDomainStatus = {
  domain: string;
  verified: boolean;
  verifiedAt: Date | null;
  lastCheckedAt: Date | null;
  records: { type: "TXT" | "CNAME"; name: string; value: string }[];
};

export type DomainResolution =
  | { kind: "active"; username: string }
  | { kind: "inactive"; username: string }
  | { kind: "unknown" };

export class CustomDomainService {
  private readonly now: () => Date;

  constructor(private readonly deps: ICustomDomainServiceDeps) {
    this.now = deps.now ?? (() => new Date());
  }

  private toStatus(stored: StoredCustomDomain): CustomDomainStatus {
    const records: CustomDomainStatus["records"] = [
      {
        type: "TXT",
        name: `${VERIFICATION_RECORD_PREFIX}.${stored.domain}`,
        value: stored.verificationToken,
      },
    ];
    if (this.deps.cnameTarget)
      records.push({ type: "CNAME", name: stored.domain, value: this.deps.cnameTarget });
    return {
      domain: stored.domain,
      verified: stored.verifiedAt !== null,
      verifiedAt: stored.verifiedAt,
      lastCheckedAt: stored.lastCheckedAt,
      records,
    };
  }

  async get(userId: number): Promise<CustomDomainStatus | null> {
    const stored = await this.deps.repository.findByUserId(userId);
    return stored ? this.toStatus(stored) : null;
  }

  async add(userId: number, input: string): Promise<CustomDomainStatus> {
    if (!(await this.deps.isEntitled(userId))) {
      throw new ErrorWithCode(ErrorCode.Forbidden, "Custom domains are part of the Pro plan");
    }
    const domain = normalizeDomain(input);
    if (!domain) throw new ErrorWithCode(ErrorCode.BadRequest, "Enter a domain like book.yourname.com");
    const reserved = this.deps.reservedHosts.some((host) => domain === host || domain.endsWith(`.${host}`));
    if (reserved) throw new ErrorWithCode(ErrorCode.BadRequest, "That domain can't be used");
    if (await this.deps.repository.isDomainTaken(domain, userId)) {
      throw new ErrorWithCode(ErrorCode.BadRequest, "That domain is already connected to another account");
    }

    const previous = await this.deps.repository.findByUserId(userId);
    if (previous?.domain === domain) return this.toStatus(previous);

    const verificationToken = `nodslot-${randomBytes(16).toString("hex")}`;
    await this.deps.repository.upsertForUser({ userId, domain, verificationToken });
    if (previous && this.deps.host) await this.deps.host.removeDomain(previous.domain).catch(() => undefined);
    if (this.deps.host) await this.deps.host.addDomain(domain);

    const stored = await this.deps.repository.findByUserId(userId);
    if (!stored) throw new ErrorWithCode(ErrorCode.InternalServerError, "Couldn't save the domain");
    return this.toStatus(stored);
  }

  /** Checks the TXT record. Ownership is proven by DNS, so a verified domain stays verified only while the record exists. */
  async verify(userId: number): Promise<CustomDomainStatus> {
    const stored = await this.deps.repository.findByUserId(userId);
    if (!stored) throw new ErrorWithCode(ErrorCode.NotFound, "Add a domain first");

    let records: string[][] = [];
    try {
      records = await this.deps.dns.resolveTxt(`${VERIFICATION_RECORD_PREFIX}.${stored.domain}`);
    } catch {
      records = [];
    }
    const found = records.some((chunks) => chunks.join("").trim() === stored.verificationToken);
    const checkedAt = this.now();
    const verifiedAt = found ? (stored.verifiedAt ?? checkedAt) : null;
    await this.deps.repository.markChecked(userId, verifiedAt, checkedAt);
    return this.toStatus({ ...stored, verifiedAt, lastCheckedAt: checkedAt });
  }

  async remove(userId: number): Promise<void> {
    const stored = await this.deps.repository.findByUserId(userId);
    if (!stored) return;
    await this.deps.repository.deleteForUser(userId);
    if (this.deps.host) await this.deps.host.removeDomain(stored.domain).catch(() => undefined);
  }

  async resolve(hostInput: string): Promise<DomainResolution> {
    const domain = normalizeDomain(hostInput);
    if (!domain) return { kind: "unknown" };
    const stored = await this.deps.repository.findByDomainIncludeUsername(domain);
    if (!stored?.verifiedAt || !stored.user.username) return { kind: "unknown" };
    const active = await this.deps.isEntitled(stored.userId);
    return { kind: active ? "active" : "inactive", username: stored.user.username };
  }
}
