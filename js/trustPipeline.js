/**
 * @file trustPipeline.js
 * @description End-to-end trust pipeline integration.
 * @frozen v1
 */

.import "appScanner.js" as AppScanner
.import "normalizers.js" as Normalizers
.import "signalEngine.js" as SignalEngine
.import "trustEngine.js" as TrustEngine
.import "explanationEngine.js" as ExplanationEngine
.import "models.js" as Models

/**
 * Builds AppTrustModel objects for all installed apps.
 * @param {string} [overrideRoot] - Optional override for testing
 * @returns {AppTrustModel[]}
 */
function buildTrustModels(overrideRoot) {
  const rawApps = AppScanner.scanInstalledApps(overrideRoot);
  const results = [];

  for (var i = 0; i < rawApps.length; i++) {
    var raw = rawApps[i];
    const model = new Models.AppTrustModel();

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
    const updateInfo = Normalizers.normalizeUpdateInfo(raw.lastUpdated);
    model.updateInfo = updateInfo;

    // Maintainer normalization
    const maintainer = Normalizers.normalizeMaintainer(raw.maintainerName);
    model.maintainer = maintainer;

    // Signals (derive AFTER normalization)
    const signals = SignalEngine.deriveTrustSignals(Object.assign({}, raw, {
      lastUpdated: updateInfo.lastUpdated,
      maintainerName: maintainer.name,
    }));

    // Trust score
    const trust = TrustEngine.calculateTrust(signals);
    model.trust = trust;

    // Explanations
    model.explanations = ExplanationEngine.getExplanations(signals);

    results.push(model);
  }

  return results;
}
