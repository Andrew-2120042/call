const HOSTNAME = /^(?=.{4,253}$)(?!-)([a-z0-9-]{1,63}(?<!-)\.)+[a-z]{2,63}$/;

/** Accepts what people paste ("https://Book.Example.com/") and returns a bare lowercase hostname, or null. */
export function normalizeDomain(input: string): string | null {
  let value = input.trim().toLowerCase();
  value = value.replace(/^[a-z]+:\/\//, "");
  value = value.split("/")[0].split("?")[0].split("#")[0];
  value = value.replace(/:\d+$/, "").replace(/\.$/, "");
  return HOSTNAME.test(value) ? value : null;
}
