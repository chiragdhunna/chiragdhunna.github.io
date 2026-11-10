import test from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const portfolioPath = path.resolve(
  __dirname,
  "../components/Portfolio/Portfolio.jsx",
);

test("Portfolio imports and wires shared category filter components and helpers", () => {
  const content = fs.readFileSync(portfolioPath, "utf8");

  // Asserts shared imports
  assert.match(
    content,
    /import\s+CategoryFilterDropdown\s+from\s+["']\.\.\/common\/CategoryFilterDropdown["'];/,
    "Portfolio.jsx must import CategoryFilterDropdown from common",
  );

  assert.match(
    content,
    /import\s*\{[^}]*getAvailableCategories[^}]*\}\s*from\s*["']\.\.\/\.\.\/utils\/categories["'];/,
    "Portfolio.jsx must import getAvailableCategories from utils/categories",
  );

  assert.match(
    content,
    /import\s*\{[^}]*categoryMatches[^}]*\}\s*from\s*["']\.\.\/\.\.\/utils\/categories["'];/,
    "Portfolio.jsx must import categoryMatches from utils/categories",
  );

  assert.match(
    content,
    /import\s*\{[^}]*filterItemsByCategory[^}]*\}\s*from\s*["']\.\.\/\.\.\/utils\/categories["'];/,
    "Portfolio.jsx must import filterItemsByCategory from utils/categories",
  );

  assert.match(
    content,
    /import\s*\{[^}]*getItemCount[^}]*\}\s*from\s*["']\.\.\/\.\.\/utils\/categories["'];/,
    "Portfolio.jsx must import getItemCount from utils/categories",
  );

  // Asserts CategoryFilterDropdown usage in Projects section
  assert.match(
    content,
    /<CategoryFilterDropdown\s+[^>]*categories=\{availableCategories\}/,
    "Portfolio.jsx must pass availableCategories to CategoryFilterDropdown in projects",
  );

  // Asserts CategoryFilterDropdown usage in Certifications section
  assert.match(
    content,
    /<CategoryFilterDropdown\s+[^>]*categories=\{certCategories\}/,
    "Portfolio.jsx must pass certCategories to CategoryFilterDropdown in certifications",
  );

  // Asserts scroll-reveal observer dependencies include selectedCertFilter
  assert.match(
    content,
    /\[\s*prefersReducedMotion\s*,\s*projects\s*,\s*certs\s*,\s*contributions\s*,\s*selectedFilter\s*,\s*selectedCertFilter,?\s*\]/,
    "Portfolio.jsx scroll-reveal effect must include selectedCertFilter in dependency array",
  );
});
