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
  const keyA = getCategoryKey(category);
  const keyB = getCategoryKey(targetCategory);
  if (!keyA || !keyB) return false;
  return keyA === keyB;
}

export function getItemCount(items, category = "All") {
  if (!Array.isArray(items)) return 0;
  if (!category || categoryMatches(category, "All")) {
    return items.length;
  }
  return items.filter(
    (item) =>
      Array.isArray(item?.categories) &&
      item.categories.some((cat) => categoryMatches(cat, category)),
  ).length;
}

export function filterItemsByCategory(items, category = "All") {
  if (!Array.isArray(items)) return [];
  if (!category || categoryMatches(category, "All")) {
    return items;
  }
  return items.filter(
    (item) =>
      Array.isArray(item?.categories) &&
      item.categories.some((cat) => categoryMatches(cat, category)),
  );
}

