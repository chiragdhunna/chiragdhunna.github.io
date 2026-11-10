import test from "node:test";
import assert from "node:assert";
import {
  categoryMatches,
  filterItemsByCategory,
  getAvailableCategories,
  getItemCount,
} from "../utils/categories.js";

test("getAvailableCategories keeps defaults first and appends sorted unique categories", () => {
  const items = [
    { categories: ["AI", "  automation  ", "Web"] },
    { categories: ["llm", "AI", "Agentic AI"] },
    { categories: ["Automation", ""] },
  ];
  const defaults = ["Web", "Mobile", "Full Stack", "Backend"];

  assert.deepStrictEqual(getAvailableCategories(items, defaults), [
    "Web",
    "Mobile",
    "Full Stack",
    "Backend",
    "Agentic AI",
    "AI",
    "automation",
    "llm",
  ]);
});

test("getAvailableCategories ignores invalid category containers", () => {
  const items = [
    {},
    { categories: null },
    { categories: "Web" },
    { categories: [null, "  ", "Data"] },
  ];

  assert.deepStrictEqual(getAvailableCategories(items), ["Data"]);
});

test("getAvailableCategories de-duplicates defaults case-insensitively", () => {
  const defaults = ["Web", "web", "  WEB  ", "Mobile"];

  assert.deepStrictEqual(getAvailableCategories([], defaults), ["Web", "Mobile"]);
});

test("categoryMatches compares categories case-insensitively and trims whitespace", () => {
  assert.strictEqual(categoryMatches("Web", "web"), true);
  assert.strictEqual(categoryMatches("  AI  ", "ai"), true);
  assert.strictEqual(categoryMatches("Agentic AI", "  AGENTIC AI  "), true);
  assert.strictEqual(categoryMatches("Full Stack", "Backend"), false);
  assert.strictEqual(categoryMatches("", ""), false);
  assert.strictEqual(categoryMatches(null, "Web"), false);
  assert.strictEqual(categoryMatches("Web", undefined), false);
  assert.strictEqual(categoryMatches(null, null), false);
});

test("getItemCount handles 'All', custom categories, missing categories, and whitespace variants", () => {
  const sampleItems = [
    { name: "P1", categories: ["Web", "Full Stack"] },
    { name: "P2", categories: ["  web  ", "Mobile"] },
    { name: "P3", categories: ["AI", "LLM"] },
    { name: "P4", categories: ["Agentic AI"] },
    { name: "P5", categories: null },
    { name: "P6" },
    { name: "P7", categories: "invalid-string" },
  ];

  // "All" variants
  assert.strictEqual(getItemCount(sampleItems, "All"), 7);
  assert.strictEqual(getItemCount(sampleItems, "all"), 7);
  assert.strictEqual(getItemCount(sampleItems, " ALL "), 7);
  assert.strictEqual(getItemCount(sampleItems, ""), 7);
  assert.strictEqual(getItemCount(sampleItems, null), 7);
  assert.strictEqual(getItemCount(null, "All"), 0);
  assert.strictEqual(getItemCount(undefined, "Web"), 0);

  // Case-insensitive & trimmed matching
  assert.strictEqual(getItemCount(sampleItems, "Web"), 2);
  assert.strictEqual(getItemCount(sampleItems, "web"), 2);
  assert.strictEqual(getItemCount(sampleItems, " WEB "), 2);
  assert.strictEqual(getItemCount(sampleItems, "Mobile"), 1);

  // Custom categories
  assert.strictEqual(getItemCount(sampleItems, "AI"), 1);
  assert.strictEqual(getItemCount(sampleItems, "LLM"), 1);
  assert.strictEqual(getItemCount(sampleItems, "Agentic AI"), 1);
  assert.strictEqual(getItemCount(sampleItems, "agentic ai"), 1);
  assert.strictEqual(getItemCount(sampleItems, "Nonexistent"), 0);
});

test("filterItemsByCategory filters items correctly with 'All', custom categories, and malformed items", () => {
  const sampleItems = [
    { name: "P1", categories: ["Web", "Full Stack"] },
    { name: "P2", categories: ["  web  ", "Mobile"] },
    { name: "P3", categories: ["AI", "LLM"] },
    { name: "P4", categories: ["Agentic AI"] },
    { name: "P5", categories: null },
    { name: "P6" },
  ];

  // "All" handling
  assert.deepStrictEqual(filterItemsByCategory(sampleItems, "All"), sampleItems);
  assert.deepStrictEqual(filterItemsByCategory(sampleItems, "all"), sampleItems);
  assert.deepStrictEqual(filterItemsByCategory(sampleItems, " ALL "), sampleItems);
  assert.deepStrictEqual(filterItemsByCategory(sampleItems, null), sampleItems);
  assert.deepStrictEqual(filterItemsByCategory(null, "Web"), []);

  // Matching with case-insensitivity and trimming
  const webMatches = filterItemsByCategory(sampleItems, "web");
  assert.strictEqual(webMatches.length, 2);
  assert.deepStrictEqual(
    webMatches.map((p) => p.name),
    ["P1", "P2"],
  );

  const aiMatches = filterItemsByCategory(sampleItems, "  ai  ");
  assert.strictEqual(aiMatches.length, 1);
  assert.strictEqual(aiMatches[0].name, "P3");

  const agenticMatches = filterItemsByCategory(sampleItems, "Agentic AI");
  assert.strictEqual(agenticMatches.length, 1);
  assert.strictEqual(agenticMatches[0].name, "P4");

  const noneMatches = filterItemsByCategory(sampleItems, "Cloud");
  assert.strictEqual(noneMatches.length, 0);
});
