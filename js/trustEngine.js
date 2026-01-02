/**
 * @file trustEngine.js
 * @description Deterministic scoring logic for Parallax Trust System.
 * @frozen v1
 */

const { TrustSignals } = require("./trustSignals");

const BASE_SCORE = 100;

// Penalty Configuration (Frozen)
const PENALTIES = {
  [TrustSignals.USES_NETWORK]: -15,
  [TrustSignals.USES_CAMERA]: -20,
  [TrustSignals.USES_MICROPHONE]: -20,
  [TrustSignals.USES_LOCATION]: -15,
  [TrustSignals.USES_STORAGE]: -10,
  [TrustSignals.STALE_APP]: -10,
  [TrustSignals.MISSING_MAINTAINER]: -5,
  [TrustSignals.WEAK_CONFINEMENT]: -15,
  [TrustSignals.MEDIUM_CONFINEMENT]: -5,
};

/**
 * Calculates the trust score and risk level based on a set of active signals.
 * @param {Set<string>|string[]} activeSignals - List of active TrustSignals
 * @returns {{score: number, riskLevel: "low"|"medium"|"high"}}
 */
function calculateTrust(activeSignals) {
  let score = BASE_SCORE;
  const signals = new Set(activeSignals);

  // Apply penalties
  for (const signal of signals) {
    if (Object.prototype.hasOwnProperty.call(PENALTIES, signal)) {
      score += PENALTIES[signal];
    } else {
      // Unknown signals are ignored in v1 as per strict rules
      console.warn(`Warning: Unknown signal encountered: ${signal}`);
    }
  }

  // Clamp Rule: 0 <= score <= 100
  score = Math.max(0, Math.min(100, score));

  // Determine Risk Level
  let riskLevel;
  if (score >= 80) {
    riskLevel = "low";
  } else if (score >= 50) {
    riskLevel = "medium";
  } else {
    riskLevel = "high";
  }

  return { score, riskLevel };
}

module.exports = { calculateTrust, PENALTIES, BASE_SCORE };
