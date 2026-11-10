function normalizeCategory(category) {
  return typeof category === "string" ? category.trim() : "";
}

function getCategoryKey(category) {
  return normalizeCategory(category).toLowerCase();
}

export function getAvailableCategories(items, defaults = []) {
  const seen = new Set();
  const defaultCategories = [];

  defaults.forEach((category) => {
    const normalized = normalizeCategory(category);
    if (!normalized) return;
    const key = getCategoryKey(normalized);
    if (seen.has(key)) return;
    seen.add(key);
    defaultCategories.push(normalized);
  });

  const dynamicCategories = [];

  items.forEach((item) => {
    if (!Array.isArray(item?.categories)) return;
    item.categories.forEach((category) => {
      const normalized = normalizeCategory(category);
      if (!normalized) return;
      const key = getCategoryKey(normalized);
      if (seen.has(key)) return;
      seen.add(key);
      dynamicCategories.push(normalized);
    });
  });

  dynamicCategories.sort((a, b) => a.localeCompare(b));

  return [...defaultCategories, ...dynamicCategories];
}

export function categoryMatches(category, targetCategory) {
  return getCategoryKey(category) === getCategoryKey(targetCategory);
}
