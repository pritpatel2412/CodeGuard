/** Remove common emoji / pictograph sequences without Unicode-property-regex (max TS compatibility). */
export function stripEmoji(text: string): string {
  if (!text) return text;
  return text
    .replace(/\uFE0F/g, "")
    .replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function isSecurityFixTitle(title: string): boolean {
  const normalized = stripEmoji(title).toLowerCase();
  return (
    normalized.includes("security fix") ||
    normalized.includes("[codeguard]") ||
    normalized.includes("auto fix")
  );
}
