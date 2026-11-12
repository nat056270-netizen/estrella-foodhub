// Sequelize exposes camelCase timestamps even when MySQL columns use snake_case.
// Add the aliases used by the UI without changing any API request or server model.
export function normalizeTimestamps(value) {
  if (Array.isArray(value)) return value.map(normalizeTimestamps);
  if (!value || typeof value !== 'object') return value;
  const result = Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeTimestamps(item)]));
  if (result.created_at === undefined && result.createdAt !== undefined) result.created_at = result.createdAt;
  if (result.updated_at === undefined && result.updatedAt !== undefined) result.updated_at = result.updatedAt;
  return result;
}
