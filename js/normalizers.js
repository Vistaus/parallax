/**
 * @file normalizers.js
 * @description Centralized normalization logic for App Trust Model fields.
 * @frozen v1
 */

/**
 * Normalizes update information from a raw Date or null.
 * @param {Date|null} lastUpdated
 * @returns {{lastUpdated: Date|null, updateAgeMonths: number|null, isStale: boolean}}
 */
function normalizeUpdateInfo(lastUpdated) {
  if (!(lastUpdated instanceof Date) || isNaN(lastUpdated.getTime())) {
    return {
      lastUpdated: null,
      updateAgeMonths: null,
      isStale: false,
    };
  }

  const now = Date.now();
  const updated = lastUpdated.getTime();

  // Future dates are treated as "just now" (0 months old), not penalized
  const diffMs = Math.max(0, now - updated);
  const months = diffMs / (1000 * 60 * 60 * 24 * 30);

  return {
    lastUpdated,
    updateAgeMonths: Math.floor(months),
    isStale: months >= 12,
  };
}

/**
 * Normalizes maintainer name from raw input.
 * @param {string|null} maintainerName
 * @returns {{name: string|null, present: boolean}}
 */
function normalizeMaintainer(maintainerName) {
  if (typeof maintainerName !== "string") {
    return { name: null, present: false };
  }

  const name = maintainerName.trim();
  if (!name) {
    return { name: null, present: false };
  }

  return { name, present: true };
}

module.exports = { normalizeUpdateInfo, normalizeMaintainer };
