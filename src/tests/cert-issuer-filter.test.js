import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  getPublicIssuers,
  filterCerts,
  countCerts,
} from "../utils/issuers.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

test("getPublicIssuers: only issuers in data, de-duplicates aliases/case/spacing, sorts, and tolerates edge cases", () => {
  // Edge cases: null, undefined, empty, malformed input
  assert.deepStrictEqual(getPublicIssuers(null), []);
  assert.deepStrictEqual(getPublicIssuers(undefined), []);
  assert.deepStrictEqual(getPublicIssuers("not an array"), []);
  assert.deepStrictEqual(getPublicIssuers([]), []);
  assert.deepStrictEqual(
    getPublicIssuers([
      null,
      undefined,
      {},
      { issuer: "" },
      { issuer: "   " },
      { issuer: 12345 },
      { issuer: null },
    ]),
    [],
  );

  // No default presets: issuers not in certs must not appear
  const testCerts = [
    { issuer: "AWS" },
    { issuer: "Microsoft" },
  ];
  const issuers = getPublicIssuers(testCerts);
  assert.deepStrictEqual(issuers, ["AWS", "Microsoft"]);
  assert.strictEqual(issuers.includes("Google Cloud"), false);
  assert.strictEqual(issuers.includes("Cisco"), false);
  assert.strictEqual(issuers.includes("Oracle"), false);

  // Case, spacing, and alias collapse:
  // "aws", "AWS ", "Amazon Web Services", "amazon" should all collapse into "AWS"
  const aliasCerts = [
    { issuer: "  Amazon Web Services  " },
    { issuer: "aws" },
    { issuer: "AWS " },
    { issuer: "microsoft azure" },
    { issuer: "Microsoft Corporation" },
    { issuer: "GCP" },
    { issuer: "Custom Issuer Corp" },
  ];
  const collapsed = getPublicIssuers(aliasCerts);
  assert.deepStrictEqual(collapsed, [
    "AWS",
    "Custom Issuer Corp",
    "Google Cloud",
    "Microsoft",
  ]);

  // Sorting: alphabetically using localeCompare
  const unsortedCerts = [
    { issuer: "Zeta Org" },
    { issuer: "Beta Org" },
    { issuer: "Alpha Org" },
  ];
  assert.deepStrictEqual(getPublicIssuers(unsortedCerts), [
    "Alpha Org",
    "Beta Org",
    "Zeta Org",
  ]);
});

test("filterCerts and countCerts: category only, issuer only, combined AND, All handling, no matches, malformed", () => {
  const sampleCerts = [
    { name: "Cert 1", issuer: "AWS", categories: ["Cloud", "AI"] },
    { name: "Cert 2", issuer: "AWS", categories: ["Cloud", "Development"] },
    { name: "Cert 3", issuer: "Microsoft", categories: ["Cloud", "Data"] },
    { name: "Cert 4", issuer: "Microsoft", categories: ["Cloud", "AI"] },
    { name: "Cert 5", issuer: "Microsoft", categories: ["AI"] },
    { name: "Malformed 1", issuer: null, categories: null },
    { name: "Malformed 2" },
  ];

  // Default: returns all valid items
  assert.strictEqual(countCerts(sampleCerts), sampleCerts.length);
  assert.deepStrictEqual(filterCerts(sampleCerts), sampleCerts);

  // Category only
  const cloudCerts = filterCerts(sampleCerts, { category: "Cloud" });
  assert.strictEqual(cloudCerts.length, 4);
  assert.strictEqual(countCerts(sampleCerts, { category: "Cloud" }), 4);

  // Issuer only
  const awsCerts = filterCerts(sampleCerts, { issuer: "AWS" });
  assert.strictEqual(awsCerts.length, 2);
  assert.strictEqual(countCerts(sampleCerts, { issuer: "AWS" }), 2);

  const msCerts = filterCerts(sampleCerts, { issuer: "Microsoft" });
  assert.strictEqual(msCerts.length, 3);
  assert.strictEqual(countCerts(sampleCerts, { issuer: "Microsoft" }), 3);

  // Issuer alias filter ("amazon web services" matches AWS)
  const awsAliasCerts = filterCerts(sampleCerts, { issuer: "amazon web services" });
  assert.strictEqual(awsAliasCerts.length, 2);

  // Both: combined AND
  const cloudAws = filterCerts(sampleCerts, { category: "Cloud", issuer: "AWS" });
  assert.strictEqual(cloudAws.length, 2);
  assert.strictEqual(countCerts(sampleCerts, { category: "Cloud", issuer: "AWS" }), 2);

  const aiMs = filterCerts(sampleCerts, { category: "AI", issuer: "Microsoft" });
  assert.strictEqual(aiMs.length, 2);

  // "All" case insensitivity on both dimensions
  assert.strictEqual(countCerts(sampleCerts, { category: "ALL", issuer: "all" }), sampleCerts.length);
  assert.strictEqual(countCerts(sampleCerts, { category: "aLl", issuer: "AWS" }), 2);
  assert.strictEqual(countCerts(sampleCerts, { category: "AI", issuer: "ALL" }), 3);

  // No matches combination
  const noMatches = filterCerts(sampleCerts, { category: "Data", issuer: "AWS" });
  assert.strictEqual(noMatches.length, 0);
  assert.strictEqual(countCerts(sampleCerts, { category: "Data", issuer: "AWS" }), 0);

  // Tolerates invalid certs input
  assert.strictEqual(countCerts(null, { category: "Cloud" }), 0);
  assert.deepStrictEqual(filterCerts(undefined, { issuer: "AWS" }), []);
});

test("Sanity: public/data/certs.json issuers and counts", () => {
  const certsPath = path.resolve(__dirname, "../../public/data/certs.json");
  const rawData = fs.readFileSync(certsPath, "utf8");
  const certs = JSON.parse(rawData);

  assert(Array.isArray(certs), "certs.json must be an array");
  assert.strictEqual(certs.length, 12, "expected 12 certs in certs.json");

  const issuers = getPublicIssuers(certs);
  assert.deepStrictEqual(issuers, ["AWS", "Microsoft"]);

  const awsCount = countCerts(certs, { issuer: "AWS" });
  const msCount = countCerts(certs, { issuer: "Microsoft" });

  assert.strictEqual(awsCount, 4);
  assert.strictEqual(msCount, 8);
  assert.strictEqual(awsCount + msCount, certs.length, "issuer counts must sum to total certs");

  // Specific cross counts verified
  assert.strictEqual(countCerts(certs, { category: "Cloud", issuer: "AWS" }), 4);
  assert.strictEqual(countCerts(certs, { category: "Cloud", issuer: "Microsoft" }), 8);
  assert.strictEqual(countCerts(certs, { category: "AI", issuer: "AWS" }), 2);
  assert.strictEqual(countCerts(certs, { category: "AI", issuer: "Microsoft" }), 3);
  assert.strictEqual(countCerts(certs, { category: "Data", issuer: "AWS" }), 0);
  assert.strictEqual(countCerts(certs, { category: "Data", issuer: "Microsoft" }), 1);
  assert.strictEqual(countCerts(certs, { category: "Development", issuer: "AWS" }), 1);
  assert.strictEqual(countCerts(certs, { category: "Development", issuer: "Microsoft" }), 2);
});

test("Wiring: Portfolio.jsx and Certifications.jsx import shared helpers and render CategoryFilterDropdown with label='Issuer'", () => {
  const portfolioPath = path.resolve(__dirname, "../components/Portfolio/Portfolio.jsx");
  const certsPagePath = path.resolve(__dirname, "../components/Certifications/Certifications.jsx");

  const portfolioContent = fs.readFileSync(portfolioPath, "utf8");
  const certsPageContent = fs.readFileSync(certsPagePath, "utf8");

  // Portfolio imports
  assert.match(
    portfolioContent,
    /import\s*\{[^}]*getPublicIssuers[^}]*\}\s*from\s*["']\.\.\/\.\.\/utils\/issuers["'];/,
    "Portfolio.jsx must import getPublicIssuers from utils/issuers",
  );
  assert.match(
    portfolioContent,
    /import\s*\{[^}]*filterCerts[^}]*\}\s*from\s*["']\.\.\/\.\.\/utils\/issuers["'];/,
    "Portfolio.jsx must import filterCerts from utils/issuers",
  );
  assert.match(
    portfolioContent,
    /import\s*\{[^}]*countCerts[^}]*\}\s*from\s*["']\.\.\/\.\.\/utils\/issuers["'];/,
    "Portfolio.jsx must import countCerts from utils/issuers",
  );

  // Portfolio renders Issuer dropdown
  assert.match(
    portfolioContent,
    /<CategoryFilterDropdown\s+[^>]*label=["']Issuer["']/,
    "Portfolio.jsx must render CategoryFilterDropdown with label='Issuer'",
  );
  assert.match(
    portfolioContent,
    /allLabel=["']All issuers["']/,
    "Portfolio.jsx must pass allLabel='All issuers' to Issuer dropdown",
  );

  // Certifications imports
  assert.match(
    certsPageContent,
    /import\s*\{[^}]*getPublicIssuers[^}]*\}\s*from\s*["']\.\.\/\.\.\/utils\/issuers["'];/,
    "Certifications.jsx must import getPublicIssuers from utils/issuers",
  );
  assert.match(
    certsPageContent,
    /import\s*\{[^}]*filterCerts[^}]*\}\s*from\s*["']\.\.\/\.\.\/utils\/issuers["'];/,
    "Certifications.jsx must import filterCerts from utils/issuers",
  );
  assert.match(
    certsPageContent,
    /import\s*\{[^}]*countCerts[^}]*\}\s*from\s*["']\.\.\/\.\.\/utils\/issuers["'];/,
    "Certifications.jsx must import countCerts from utils/issuers",
  );

  // Certifications renders Issuer dropdown
  assert.match(
    certsPageContent,
    /<CategoryFilterDropdown\s+[^>]*label=["']Issuer["']/,
    "Certifications.jsx must render CategoryFilterDropdown with label='Issuer'",
  );
  assert.match(
    certsPageContent,
    /allLabel=["']All issuers["']/,
    "Certifications.jsx must pass allLabel='All issuers' to Issuer dropdown",
  );
});
