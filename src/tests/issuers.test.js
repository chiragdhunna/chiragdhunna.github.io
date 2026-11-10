import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_ISSUERS,
  ISSUER_ALIASES,
  normalizeIssuer,
  getIssuerKey,
  issuerMatches,
  canonicalizeIssuer,
  getAvailableIssuers,
} from "../utils/issuers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("normalizeIssuer: trims, collapses whitespace, and handles non-strings", () => {
  assert.strictEqual(normalizeIssuer("   AWS   "), "AWS");
  assert.strictEqual(
    normalizeIssuer("Amazon   Web    Services"),
    "Amazon Web Services",
  );
  assert.strictEqual(normalizeIssuer(""), "");
  assert.strictEqual(normalizeIssuer("   "), "");
  assert.strictEqual(normalizeIssuer(null), "");
  assert.strictEqual(normalizeIssuer(undefined), "");
  assert.strictEqual(normalizeIssuer(123), "");
  assert.strictEqual(normalizeIssuer({}), "");
});

test("getIssuerKey & issuerMatches: case-insensitivity, whitespace, and alias resolution", () => {
  assert.strictEqual(getIssuerKey("AWS"), "aws");
  assert.strictEqual(getIssuerKey("  aws  "), "aws");
  assert.strictEqual(getIssuerKey("Amazon Web Services"), "aws");
  assert.strictEqual(getIssuerKey("amazon"), "aws");
  assert.strictEqual(getIssuerKey("Microsoft Corporation"), "microsoft");
  assert.strictEqual(getIssuerKey("Microsoft Azure"), "microsoft");
  assert.strictEqual(getIssuerKey("azure"), "microsoft");
  assert.strictEqual(getIssuerKey("Google Cloud Platform"), "google cloud");
  assert.strictEqual(getIssuerKey("GCP"), "google cloud");
  assert.strictEqual(getIssuerKey("google"), "google cloud");
  assert.strictEqual(getIssuerKey("The Linux Foundation"), "linux foundation");

  assert.strictEqual(issuerMatches("Amazon Web Services", "AWS"), true);
  assert.strictEqual(issuerMatches("aws", "Amazon Web Services"), true);
  assert.strictEqual(issuerMatches("Microsoft Corporation", "Microsoft"), true);
  assert.strictEqual(issuerMatches("GCP", "Google Cloud"), true);
  assert.strictEqual(issuerMatches("AWS", "Microsoft"), false);
  assert.strictEqual(issuerMatches("", "AWS"), false);
  assert.strictEqual(issuerMatches(null, "AWS"), false);
  assert.strictEqual(issuerMatches("AWS", undefined), false);
  assert.strictEqual(issuerMatches("", ""), false);
});

test("canonicalizeIssuer: returns option display text on match, otherwise normalized typed text", () => {
  const options = ["AWS", "Microsoft", "Google Cloud", "Acme Academy"];

  // Matches option directly
  assert.strictEqual(canonicalizeIssuer("AWS", options), "AWS");
  assert.strictEqual(canonicalizeIssuer("aws", options), "AWS");
  assert.strictEqual(canonicalizeIssuer("  AWS  ", options), "AWS");

  // Matches option via alias
  assert.strictEqual(
    canonicalizeIssuer("Amazon Web Services", options),
    "AWS",
  );
  assert.strictEqual(
    canonicalizeIssuer("  amazon web services  ", options),
    "AWS",
  );
  assert.strictEqual(
    canonicalizeIssuer("Microsoft Corporation", options),
    "Microsoft",
  );
  assert.strictEqual(canonicalizeIssuer("gcp", options), "Google Cloud");

  // Matches custom option case-insensitively
  assert.strictEqual(
    canonicalizeIssuer("acme academy", options),
    "Acme Academy",
  );
  assert.strictEqual(
    canonicalizeIssuer("  ACME   ACADEMY  ", options),
    "Acme Academy",
  );

  // New unlisted issuer: returns normalized string
  assert.strictEqual(
    canonicalizeIssuer("   Custom University   ", options),
    "Custom University",
  );

  // Empty / invalid input
  assert.strictEqual(canonicalizeIssuer("", options), "");
  assert.strictEqual(canonicalizeIssuer(null, options), "");
  assert.strictEqual(canonicalizeIssuer(undefined, options), "");
});

test("getAvailableIssuers: defaults first, dynamic issuers appended and sorted, duplicates collapse", () => {
  const certs = [
    { issuer: "AWS" },
    { issuer: "aws " },
    { issuer: "Amazon Web Services" },
    { issuer: "Microsoft" },
    { issuer: "Beta Institute" },
    { issuer: "Alpha Academy" },
    { issuer: "  beta institute  " },
    { issuer: null },
    {},
    { issuer: 123 },
  ];

  const result = getAvailableIssuers(certs);

  // 1. Defaults are first and in exact order
  assert.strictEqual(result.slice(0, DEFAULT_ISSUERS.length).join(","), DEFAULT_ISSUERS.join(","));

  // 2. AWS and Microsoft are not duplicated
  const awsCount = result.filter((i) => i.toLowerCase() === "aws").length;
  assert.strictEqual(awsCount, 1);

  const msCount = result.filter((i) => i.toLowerCase() === "microsoft").length;
  assert.strictEqual(msCount, 1);

  // 3. Dynamic issuers appended and sorted alphabetically
  const customIssuers = result.slice(DEFAULT_ISSUERS.length);
  assert.deepStrictEqual(customIssuers, ["Alpha Academy", "Beta Institute"]);

  // 4. Handles null/empty certs safely
  assert.deepStrictEqual(getAvailableIssuers(null), DEFAULT_ISSUERS);
  assert.deepStrictEqual(getAvailableIssuers([]), DEFAULT_ISSUERS);
  assert.deepStrictEqual(getAvailableIssuers(undefined), DEFAULT_ISSUERS);
});

test("Sanity: every issuer in public/data/certs.json is present in getAvailableIssuers", () => {
  const certsJsonPath = path.resolve(__dirname, "../../public/data/certs.json");
  const certs = JSON.parse(fs.readFileSync(certsJsonPath, "utf8"));
  const available = getAvailableIssuers(certs);

  certs.forEach((cert) => {
    if (cert.issuer) {
      const exists = available.some((opt) => issuerMatches(opt, cert.issuer));
      assert.strictEqual(
        exists,
        true,
        `Issuer "${cert.issuer}" from certs.json must be present in available issuers`,
      );
    }
  });
});

test("Wiring: CertForm imports issuers helpers and renders IssuerPicker; AdminDashboard passes existingCerts", () => {
  const certFormPath = path.resolve(
    __dirname,
    "../components/Admin/CertForm.jsx",
  );
  const certFormContent = fs.readFileSync(certFormPath, "utf8");

  assert.match(
    certFormContent,
    /import\s+IssuerPicker\s+from\s+["']\.\/IssuerPicker["'];/,
    "CertForm.jsx must import IssuerPicker",
  );

  assert.match(
    certFormContent,
    /import\s*\{[^}]*getAvailableIssuers[^}]*\}\s*from\s*["']\.\.\/\.\.\/utils\/issuers["'];/,
    "CertForm.jsx must import getAvailableIssuers from utils/issuers",
  );

  assert.match(
    certFormContent,
    /import\s*\{[^}]*canonicalizeIssuer[^}]*\}\s*from\s*["']\.\.\/\.\.\/utils\/issuers["'];/,
    "CertForm.jsx must import canonicalizeIssuer from utils/issuers",
  );

  assert.match(
    certFormContent,
    /<IssuerPicker[\s\S]*options=\{issuerOptions\}[\s\S]*\/>/,
    "CertForm.jsx must render IssuerPicker with options={issuerOptions}",
  );

  const adminDashboardPath = path.resolve(
    __dirname,
    "../components/Admin/AdminDashboard.jsx",
  );
  const adminDashboardContent = fs.readFileSync(adminDashboardPath, "utf8");

  assert.match(
    adminDashboardContent,
    /<CertForm[\s\S]*existingCerts=\{certs\}[\s\S]*\/>/,
    "AdminDashboard.jsx must pass existingCerts={certs} to CertForm",
  );
});

