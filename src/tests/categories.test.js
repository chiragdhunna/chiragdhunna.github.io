import test from "node:test";
import assert from "node:assert";
import { getAvailableCategories } from "../utils/categories.js";

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
