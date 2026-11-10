import { categoryMatches } from "./categories.js";

export const DEFAULT_ISSUERS = [
  "AWS",
  "Microsoft",
  "Google Cloud",
  "Oracle",
  "IBM",
  "Cisco",
  "CompTIA",
  "Red Hat",
  "Linux Foundation",
  "HashiCorp",
  "Databricks",
  "Snowflake",
  "NVIDIA",
  "Salesforce",
  "Meta",
  "Coursera",
  "Udemy",
  "freeCodeCamp",
];

export const ISSUER_ALIASES = {
  "amazon web services": "AWS",
  amazon: "AWS",
  aws: "AWS",
  "microsoft corporation": "Microsoft",
  "microsoft azure": "Microsoft",
  azure: "Microsoft",
  google: "Google Cloud",
  "google cloud platform": "Google Cloud",
  gcp: "Google Cloud",
  "ibm corporation": "IBM",
  "the linux foundation": "Linux Foundation",
};

export function normalizeIssuer(value) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ");
}

export function getIssuerKey(value) {
  const normalized = normalizeIssuer(value).toLowerCase();
  if (!normalized) return "";
  if (Object.prototype.hasOwnProperty.call(ISSUER_ALIASES, normalized)) {
    return normalizeIssuer(ISSUER_ALIASES[normalized]).toLowerCase();
  }
  return normalized;
}

export function issuerMatches(a, b) {
  const keyA = getIssuerKey(a);
  const keyB = getIssuerKey(b);
  if (!keyA || !keyB) return false;
  return keyA === keyB;
}

export function canonicalizeIssuer(input, options = []) {
  const normalized = normalizeIssuer(input);
  if (!normalized) return "";

  if (Array.isArray(options) && options.length > 0) {
    const matchedOption = options.find((opt) => issuerMatches(opt, normalized));
    if (matchedOption) return matchedOption;
  }

  const matchedDefault = DEFAULT_ISSUERS.find((def) =>
    issuerMatches(def, normalized),
  );
  if (matchedDefault) return matchedDefault;

  const lower = normalized.toLowerCase();
  if (Object.prototype.hasOwnProperty.call(ISSUER_ALIASES, lower)) {
    return ISSUER_ALIASES[lower];
  }

  return normalized;
}

export function getAvailableIssuers(certs, defaults = DEFAULT_ISSUERS) {
  const seenKeys = new Set();
  const defaultList = [];

  (defaults || []).forEach((item) => {
    const normalized = normalizeIssuer(item);
    if (!normalized) return;
    const key = getIssuerKey(normalized);
    if (seenKeys.has(key)) return;
    seenKeys.add(key);
    defaultList.push(normalized);
  });

  const dynamicIssuers = [];

  if (Array.isArray(certs)) {
    certs.forEach((cert) => {
      const raw = cert?.issuer;
      const normalized = normalizeIssuer(raw);
      if (!normalized) return;
      const key = getIssuerKey(normalized);
      if (seenKeys.has(key)) return;
      seenKeys.add(key);
      dynamicIssuers.push(normalized);
    });
  }

  dynamicIssuers.sort((a, b) => a.localeCompare(b));

  return [...defaultList, ...dynamicIssuers];
}

export function getPublicIssuers(certs) {
  if (!Array.isArray(certs)) return [];

  const seenKeys = new Set();
  const result = [];

  certs.forEach((cert) => {
    const raw = cert?.issuer;
    const normalized = normalizeIssuer(raw);
    if (!normalized) return;

    const key = getIssuerKey(normalized);
    if (!key || seenKeys.has(key)) return;
    seenKeys.add(key);

    const displayText = canonicalizeIssuer(normalized);
    result.push(displayText || normalized);
  });

  result.sort((a, b) => a.localeCompare(b));
  return result;
}

export function filterCerts(certs, { category = "All", issuer = "All" } = {}) {
  if (!Array.isArray(certs)) return [];

  const matchAllCategories = !category || categoryMatches(category, "All");
  const matchAllIssuers =
    !issuer || normalizeIssuer(issuer).toLowerCase() === "all";

  return certs.filter((cert) => {
    const catMatch =
      matchAllCategories ||
      (Array.isArray(cert?.categories) &&
        cert.categories.some((cat) => categoryMatches(cat, category)));
    const issMatch = matchAllIssuers || issuerMatches(cert?.issuer, issuer);

    return catMatch && issMatch;
  });
}

export function countCerts(certs, options = {}) {
  return filterCerts(certs, options).length;
}
