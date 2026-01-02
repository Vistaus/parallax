/**
 * @file trustEngine.js
 * @description Deterministic scoring logic for Parallax Trust System.
 * @frozen v1
 */

.import "trustSignals.js" as TS

var TrustSignals = TS.TrustSignals;
const BASE_SCORE = 100;

// Penalty Configuration (Frozen)
const PENALTIES = {};
PENALTIES[TrustSignals.USES_NETWORK] = -15;
PENALTIES[TrustSignals.USES_CAMERA] = -20;
PENALTIES[TrustSignals.USES_MICROPHONE] = -20;
PENALTIES[TrustSignals.USES_LOCATION] = -15;
PENALTIES[TrustSignals.USES_STORAGE] = -10;
PENALTIES[TrustSignals.STALE_APP] = -10;
PENALTIES[TrustSignals.MISSING_MAINTAINER] = -5;
PENALTIES[TrustSignals.WEAK_CONFINEMENT] = -15;
PENALTIES[TrustSignals.MEDIUM_CONFINEMENT] = -5;

/**
 * Calculates the trust score and risk level based on a set of active signals.
 * @param {Set<string>|string[]} activeSignals - List of active TrustSignals
 * @returns {{score: number, riskLevel: "low"|"medium"|"high"}}
 */
function calculateTrust(activeSignals) {
  let score = BASE_SCORE;
  // Handle Set or Array conversion if needed
  // In QML JS, Set might not be fully iterable with for-of loop if it's a polyfill, but generally ES6 Set is supported.
  // Assuming activeSignals is iterable.
  // If activeSignals is a Set from signalEngine (which uses new Set()), keep using it.
  
  // Safe iteration
  var signalsArray = [];
  if (activeSignals instanceof Set) {
      activeSignals.forEach(function(s) { signalsArray.push(s); });
  } else {
      signalsArray = activeSignals;
  }

  // Apply penalties
  for (var i = 0; i < signalsArray.length; i++) {
    var signal = signalsArray[i];
    if (PENALTIES.hasOwnProperty(signal)) {
      score += PENALTIES[signal];
    } else {
      // Unknown signals are ignored in v1 as per strict rules
      console.warn("Warning: Unknown signal encountered: " + signal);
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

  return { score: score, riskLevel: riskLevel };
}
