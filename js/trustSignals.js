/**
 * @file trustSignals.js
 * @description Taxonomy of all possible Trust Signals.
 * @frozen v1
 */

const TrustSignals = Object.freeze({
  // Permissions
  USES_NETWORK: "USES_NETWORK",
  USES_CAMERA: "USES_CAMERA",
  USES_MICROPHONE: "USES_MICROPHONE",
  USES_LOCATION: "USES_LOCATION",
  USES_STORAGE: "USES_STORAGE",

  // Metadata
  STALE_APP: "STALE_APP",
  MISSING_MAINTAINER: "MISSING_MAINTAINER",

  // Confinement
  WEAK_CONFINEMENT: "WEAK_CONFINEMENT",
  MEDIUM_CONFINEMENT: "MEDIUM_CONFINEMENT",
});

module.exports = { TrustSignals };
