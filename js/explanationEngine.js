/**
 * @file explanationEngine.js
 * @description Converts Trust Signals into human-readable explanations.
 * @frozen v1
 */

.import "trustSignals.js" as TS

var TrustSignals = TS.TrustSignals;

// Explanation Contract (Frozen)
const EXPLANATIONS = {};
EXPLANATIONS[TrustSignals.USES_NETWORK] = "This app can access the internet.";
EXPLANATIONS[TrustSignals.USES_CAMERA] = "This app can access the camera.";
EXPLANATIONS[TrustSignals.USES_MICROPHONE] = "This app can access the microphone.";
EXPLANATIONS[TrustSignals.USES_LOCATION] = "This app can access your location.";
EXPLANATIONS[TrustSignals.USES_STORAGE] = "This app can access local storage.";
EXPLANATIONS[TrustSignals.STALE_APP] = "This app hasn’t been updated in over a year.";
EXPLANATIONS[TrustSignals.MISSING_MAINTAINER] = "This app has no listed maintainer.";
EXPLANATIONS[TrustSignals.WEAK_CONFINEMENT] = "This app has fewer system restrictions than most apps.";
EXPLANATIONS[TrustSignals.MEDIUM_CONFINEMENT] = "This app has moderate system restrictions.";

/**
 * Returns a list of explanation strings for the given signals.
 * @param {Set<string>|string[]} activeSignals
 * @returns {string[]}
 */
function getExplanations(activeSignals) {
  const explanations = [];
  
  // Safe iteration
  var signalsArray = [];
  if (activeSignals instanceof Set) {
      activeSignals.forEach(function(s) { signalsArray.push(s); });
  } else {
      signalsArray = activeSignals;
  }

  for (var i = 0; i < signalsArray.length; i++) {
    var signal = signalsArray[i];
    if (EXPLANATIONS.hasOwnProperty(signal)) {
      explanations.push(EXPLANATIONS[signal]);
    }
  }

  return explanations.sort(); 
}
