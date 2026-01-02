/**
 * @file models.js
 * @description Canonical Data Models for Parallax.
 * @frozen v1
 */

/**
 * @typedef {Object} Permissions
 * @property {boolean} network
 * @property {boolean} camera
 * @property {boolean} microphone
 * @property {boolean} location
 * @property {boolean} storage
 */

/**
 * @typedef {Object} UpdateInfo
 * @property {Date|null} lastUpdated
 * @property {number|null} updateAgeMonths
 * @property {boolean} isStale
 */

/**
 * @typedef {Object} Maintainer
 * @property {string|null} name
 * @property {boolean} present
 */

/**
 * @typedef {Object} TrustScore
 * @property {number} score
 * @property {string} riskLevel "low" | "medium" | "high"
 */

class AppTrustModel {
  constructor() {
    /** @type {string} */
    this.appId = "";
    /** @type {string} */
    this.displayName = "";
    /** @type {string} */
    this.version = "";
    /** @type {string|null} */
    this.iconPath = null;

    /** @type {"strict"|"medium"|"weak"} */
    this.confinement = "strict";

    /** @type {Permissions} */
    this.permissions = {
      network: false,
      camera: false,
      microphone: false,
      location: false,
      storage: false,
    };

    /** @type {UpdateInfo} */
    this.updateInfo = {
      lastUpdated: null,
      updateAgeMonths: null,
      isStale: false,
    };

    /** @type {Maintainer} */
    this.maintainer = {
      name: null,
      present: false,
    };

    /** @type {TrustScore} */
    this.trust = {
      score: 0,
      riskLevel: "low", // default safe until calculated
    };

    /** @type {string[]} */
    this.explanations = [];
  }
}

module.exports = { AppTrustModel };
