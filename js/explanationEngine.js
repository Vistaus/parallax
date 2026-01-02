/**
 * @file explanationEngine.js
 * @description Converts Trust Signals into human-readable explanations.
 * @frozen v1
 */

const { TrustSignals } = require("./trustSignals");

// Explanation Contract (Frozen)
const EXPLANATIONS = {
  [TrustSignals.USES_NETWORK]: "This app can access the internet.",
  [TrustSignals.USES_CAMERA]: "This app can access the camera.",
  [TrustSignals.USES_MICROPHONE]: "This app can access the microphone.",
  [TrustSignals.USES_LOCATION]: "This app can access your location.",
  [TrustSignals.USES_STORAGE]: "This app can access local storage.",

  [TrustSignals.STALE_APP]: "This app hasn’t been updated in over a year.",
  [TrustSignals.MISSING_MAINTAINER]: "This app has no listed maintainer.",

  [TrustSignals.WEAK_CONFINEMENT]:
    "This app has fewer system restrictions than most apps.",
  [TrustSignals.MEDIUM_CONFINEMENT]:
    "This app has moderate system restrictions.",
};

/**
 * Returns a list of explanation strings for the given signals.
 * @param {Set<string>|string[]} activeSignals
 * @returns {string[]}
 */
function getExplanations(activeSignals) {
  const explanations = [];
  const signals = new Set(activeSignals);

  for (const signal of signals) {
    if (Object.prototype.hasOwnProperty.call(EXPLANATIONS, signal)) {
      explanations.push(EXPLANATIONS[signal]);
    }
  }

  return explanations.sort(); // Deterministic order usually preferred, simple sort for now
}

module.exports = { getExplanations, EXPLANATIONS };
