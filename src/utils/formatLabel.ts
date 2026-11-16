// src/utils/formatLabel.ts

/**
 * Fills `{name}` placeholders in a label template, so label props stay plain
 * translatable strings: formatLabel('Remove tag {tag}', { tag: 'vue' }).
 * Unknown placeholders are left as written.
 */
export function formatLabel(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => values[key] ?? match)
}
