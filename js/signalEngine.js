/**
 * @file signalEngine.js
 * @description Converts raw app metadata into TrustSignals.
 * @frozen v1
 */

const { TrustSignals } = require("./trustSignals");

/**
 * @param {Object} rawApp
 * @returns {Set<string>}
 */
function deriveTrustSignals(rawApp) {
  const signals = new Set();

  // Permissions
  if (rawApp.permissions && rawApp.permissions.network) {
    signals.add(TrustSignals.USES_NETWORK);
  }
  if (rawApp.permissions && rawApp.permissions.camera) {
    signals.add(TrustSignals.USES_CAMERA);
  }
  if (rawApp.permissions && rawApp.permissions.microphone) {
    signals.add(TrustSignals.USES_MICROPHONE);
  }
  if (rawApp.permissions && rawApp.permissions.location) {
    signals.add(TrustSignals.USES_LOCATION);
  }
  if (rawApp.permissions && rawApp.permissions.storage) {
    signals.add(TrustSignals.USES_STORAGE);
  }

  // Confinement
  // Scanner emits: "weak", "medium", "strict", "unknown"
  // Skeleton prompt map: "unconfined"->WEAK, "custom"->MEDIUM
  // My scanner maps: "weak" (was unconfined) -> WEAK, "medium" (was partial) -> MEDIUM
  // So we match the scanner's output here.
  const confinement = rawApp.confinement || rawApp.confinementRaw; // Handle both if naming varies

  switch (confinement) {
    case "weak":
    case "unconfined": // Handle potential raw variance just in case
      signals.add(TrustSignals.WEAK_CONFINEMENT);
      break;
    case "medium":
    case "custom":
      signals.add(TrustSignals.MEDIUM_CONFINEMENT);
      break;
    default:
      // strict, unknown, declared -> no signal
      break;
  }

  // Update freshness
  if (rawApp.lastUpdated instanceof Date) {
    const months =
      (Date.now() - rawApp.lastUpdated.getTime()) / (1000 * 60 * 60 * 24 * 30);

    if (months >= 12) {
      signals.add(TrustSignals.STALE_APP);
    }
  }

  // Maintainer
  if (!rawApp.maintainerName) {
    signals.add(TrustSignals.MISSING_MAINTAINER);
  }

  return signals;
}

module.exports = { deriveTrustSignals };
