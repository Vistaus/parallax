/**
 * @file trustPipeline.js
 * @description End-to-end trust pipeline integration.
 * @frozen v1
 */

const { scanInstalledApps } = require("./appScanner");
const { normalizeUpdateInfo, normalizeMaintainer } = require("./normalizers");
const { deriveTrustSignals } = require("./signalEngine");
const { calculateTrust } = require("./trustEngine");
const { getExplanations } = require("./explanationEngine");
const { AppTrustModel } = require("./models");

/**
 * Builds AppTrustModel objects for all installed apps.
 * @param {string} [overrideRoot] - Optional override for testing
 * @returns {AppTrustModel[]}
 */
function buildTrustModels(overrideRoot) {
  const rawApps = scanInstalledApps(overrideRoot);
  const results = [];

  for (const raw of rawApps) {
    const model = new AppTrustModel();

    // Identity
    model.appId = raw.appId || "";
    model.displayName = raw.displayName || raw.appId || "Unknown App";
    model.version = raw.version || "";
    model.iconPath = raw.iconPath || null;

    // Permissions (pass-through)
    model.permissions = raw.permissions || model.permissions;

    // Confinement (normalized later via signals)
    model.confinement = "strict"; // default; final meaning inferred from signals

    // Update normalization
    const updateInfo = normalizeUpdateInfo(raw.lastUpdated);
    model.updateInfo = updateInfo;

    // Maintainer normalization
    const maintainer = normalizeMaintainer(raw.maintainerName);
    model.maintainer = maintainer;

    // Signals (derive AFTER normalization)
    const signals = deriveTrustSignals({
      ...raw,
      lastUpdated: updateInfo.lastUpdated,
      maintainerName: maintainer.name,
    });

    // Trust score
    const trust = calculateTrust(signals);
    model.trust = trust;

    // Explanations
    model.explanations = getExplanations(signals);

    results.push(model);
  }

  return results;
}

module.exports = { buildTrustModels };
