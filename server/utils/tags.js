function normalizeTags(tags) {
  if (Array.isArray(tags)) {
    return tags.filter(Boolean);
  }
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return undefined;
}

module.exports = { normalizeTags };
