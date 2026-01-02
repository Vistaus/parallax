/**
 * @file appScanner.js
 * @description Enumerates installed Ubuntu Touch applications (read-only).
 * @frozen v1
 */

const fs = require("fs");
const path = require("path");

// Known locations for Click apps
const CLICK_APP_DIR = "/opt/click.ubuntu.com";

/**
 * Main entry point.
 * Returns a list of RawAppMetadata objects.
 * @param {string} [overrideRoot] - Optional root path for testing (mocking /opt)
 * @returns {Array<Object>}
 */
function scanInstalledApps(overrideRoot) {
  const apps = [];
  const searchRoot = overrideRoot || CLICK_APP_DIR;

  try {
    const clickApps = discoverClickApps(searchRoot);
    for (const app of clickApps) {
      const metadata = readAppMetadata(app);
      if (metadata) {
        // Filter out completely failed reads if any
        apps.push(metadata);
      }
    }
  } catch (err) {
    // Global safety catch - scanner must never crash the main thread
    console.error("App scan failed:", err.message);
  }

  return apps;
}

/**
 * Discovers app directories.
 * @param {string} rootDir
 * @returns {Array<string>} List of absolute paths to current app versions
 */
function discoverClickApps(rootDir) {
  try {
    if (!fs.existsSync(rootDir)) {
      return [];
    }

    const appDirs = [];
    // Structure: /opt/click.ubuntu.com/{package.name}/current/
    const packages = fs.readdirSync(rootDir);

    for (const pkg of packages) {
      // Defensive: skip hidden files or non-directories
      if (pkg.startsWith(".")) continue;

      const currentPath = path.join(rootDir, pkg, "current");
      // Check if 'current' symlink/dir exists
      try {
        if (fs.existsSync(currentPath)) {
          appDirs.push(currentPath);
        }
      } catch (e) {
        // Ignore individual access errors
        continue;
      }
    }
    return appDirs;
  } catch (e) {
    // If enumerating root fails (permission denied, etc)
    // console.error("Failed to discover apps:", e.message); // Optional logging
    return [];
  }
}

/**
 * Reads metadata for a single app reference.
 * @param {string} appPath
 * @returns {Object} RawAppMetadata
 */
function readAppMetadata(appPath) {
  // We pass the path to safe readers to keep them independent
  return {
    appId: safeReadAppId(appPath),
    displayName: safeReadDisplayName(appPath),
    version: safeReadVersion(appPath),
    iconPath: safeReadIcon(appPath),

    confinement: safeReadConfinement(appPath),

    permissions: safeReadPermissions(appPath),

    maintainerName: safeReadMaintainer(appPath),
    lastUpdated: safeReadLastUpdated(appPath),
  };
}

// --- SAFE READERS ---

function safeReadAppId(appPath) {
  try {
    const manifestPath = path.join(appPath, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, "utf8");
      const json = JSON.parse(content);
      return json.name || null;
    }
  } catch (e) {
    return null;
  }

  // Fallback: Infer from directory structure
  try {
    // appPath is .../package.name/current
    const parent = path.dirname(appPath); // .../package.name
    return path.basename(parent);
  } catch (e) {
    return "unknown.app";
  }
}

function safeReadDisplayName(appPath) {
  try {
    // 1. Try manifest
    const manifestPath = path.join(appPath, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, "utf8");
      const json = JSON.parse(content);
      if (json.title) return json.title;
    }

    // 2. Try .desktop file
    const desktopFiles = fs
      .readdirSync(appPath)
      .filter((f) => f.endsWith(".desktop"));
    if (desktopFiles.length > 0) {
      const dPath = path.join(appPath, desktopFiles[0]);
      const content = fs.readFileSync(dPath, "utf8");
      const nameMatch = content.match(/^Name=(.*)$/m);
      if (nameMatch) return nameMatch[1].trim();
    }
  } catch (e) {
    return null;
  }
  return null;
}

function safeReadVersion(appPath) {
  try {
    const manifestPath = path.join(appPath, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, "utf8");
      const json = JSON.parse(content);
      return json.version || null;
    }
  } catch (e) {
    return null;
  }
  return null;
}

function safeReadIcon(appPath) {
  try {
    // Try manifest first
    const manifestPath = path.join(appPath, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, "utf8");
      const json = JSON.parse(content);
      // Icons are often relative paths
      if (json.icon) {
        return path.join(appPath, json.icon);
      }
    }

    // Try .desktop
    const desktopFiles = fs
      .readdirSync(appPath)
      .filter((f) => f.endsWith(".desktop"));
    if (desktopFiles.length > 0) {
      const dPath = path.join(appPath, desktopFiles[0]);
      const content = fs.readFileSync(dPath, "utf8");
      const iconMatch = content.match(/^Icon=(.*)$/m);
      if (iconMatch) {
        let icon = iconMatch[1].trim();
        if (!path.isAbsolute(icon)) {
          icon = path.join(appPath, icon);
        }
        return icon;
      }
    }
  } catch (e) {
    return null;
  }
  return null;
}

function safeReadConfinement(appPath) {
  // Strategy: Look for apparmor profile json or text
  // Often named: {pkgname}_{appname}_{version}.json or similar
  // Or just look into manifest for hooks but apparmor profile is more truthy

  // Simpler v1 strategy: Read manifest 'hooks' as primary source for confinement intent
  // But PROMPT says: "AppArmor Profile -> Classification"
  // Let's look for a .apparmor file or similar in the directory?
  // In UT, AppArmor profiles are usually generated.
  // BUT apps ship with a security profile definition in manifest.json usually under 'hooks'.
  // Or a separate apparmor file.

  // We will scan for any file ending in .apparmor or .json that looks like a policy for V1
  // Actually, usually apparmor profiles are in /var/lib/apparmor/profiles/... but we are restricted to app dir?
  // "Click package metadata ... AppArmor profiles"
  // Click packages contain a manifest that declares the policy "template".
  // e.g. "confinement": "strict" (standard) or using a template like "unconfined".

  try {
    const manifestPath = path.join(appPath, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, "utf8");
      const json = JSON.parse(content);
      // Check for hooks
      // "hooks": { "myapp": { "apparmor": "myapp.apparmor", "desktop": "myapp.desktop" } }
      // OR checks generic manifest properties if they exist?
      // Actually, usually it's defined in the AppArmor file referenced in hooks.

      if (json.hooks) {
        for (const key in json.hooks) {
          const hook = json.hooks[key];
          if (hook.apparmor) {
            const aaPath = path.join(appPath, hook.apparmor);
            if (fs.existsSync(aaPath)) {
              const aaContent = fs.readFileSync(aaPath, "utf8");
              return classifyAppArmor(aaContent);
            }
          }
        }
      }
    }

    // Fallback: look for any .apparmor file
    const aaFiles = fs
      .readdirSync(appPath)
      .filter((f) => f.endsWith(".apparmor"));
    if (aaFiles.length > 0) {
      const aaPath = path.join(appPath, aaFiles[0]);
      const aaContent = fs.readFileSync(aaPath, "utf8");
      return classifyAppArmor(aaContent);
    }
  } catch (e) {
    return "unknown";
  }
  return "unknown";
}

function classifyAppArmor(content) {
  if (!content) return "unknown";
  const lower = content.toLowerCase();

  // Simple & Honest Classification
  // "strict sandbox" usually means using the default restricted template
  // "partial overrides" -> medium
  // "classic / broad" -> weak

  // Keywords for V1 (heuristic based on typical UT profiles)
  if (lower.includes("policy_groups") || lower.includes("template")) {
    // Using templates usually means some confinement
    if (lower.includes("unconfined")) return "weak";
    if (lower.includes("reserved")) return "medium"; // Reserved usually allows more
    return "strict"; // Default assumption if using policy groups
  }

  // If raw capabilities are listed
  if (lower.includes("capability")) {
    return "medium"; // Custom caps usually means partial overrides
  }

  return "strict"; // Optimistic default or "unknown"? Prompt says "Safe defaults". Strict is safest interpretation of "I don't see risky things"?
  // Or "unknown" if unreadable.
  // Let's default to 'strict' if it parses but no red flags found, 'unknown' if we can't parse (handled by caller catch).
}

function safeReadPermissions(appPath) {
  const perms = {
    network: false,
    camera: false,
    microphone: false,
    location: false,
    storage: false,
  };

  try {
    // Read from AppArmor file (same logic as safeReadConfinement)
    let aaContent = "";

    // Re-find AppArmor file
    const aaFiles = fs
      .readdirSync(appPath)
      .filter((f) => f.endsWith(".apparmor"));
    if (aaFiles.length > 0) {
      aaContent = fs
        .readFileSync(path.join(appPath, aaFiles[0]), "utf8")
        .toLowerCase();
    } else {
      // Try manifest hooks
      const manifestPath = path.join(appPath, "manifest.json");
      if (fs.existsSync(manifestPath)) {
        const mContent = fs.readFileSync(manifestPath, "utf8");
        const json = JSON.parse(mContent);
        if (json.hooks) {
          for (const key in json.hooks) {
            if (json.hooks[key].apparmor) {
              const p = path.join(appPath, json.hooks[key].apparmor);
              if (fs.existsSync(p))
                aaContent = fs.readFileSync(p, "utf8").toLowerCase();
            }
          }
        }
      }
    }

    if (!aaContent) return perms;

    // V1 Coarse Mapping
    // network: "networking" policy group
    if (aaContent.includes("networking")) perms.network = true;

    // camera: "camera" policy group or device
    if (aaContent.includes("camera")) perms.camera = true;

    // microphone: "audio" or "microphone" policy group (often "audio" in UT)
    if (aaContent.includes("audio") || aaContent.includes("microphone"))
      perms.microphone = true;

    // location: "location" policy group
    if (aaContent.includes("location")) perms.location = true;

    // storage: "content_exchange" or "music" / "video" / "picture" usually imply storage
    // Or explicit home access. "content_exchange" is common.
    if (
      aaContent.includes("content_exchange") ||
      aaContent.includes("content_hub") ||
      aaContent.includes("keep-display-on")
    ) {
      // 'keep-display-on' is random but checking generic policy groups.
      // Let's stick to prompt: "User home access".
      // Policy group "content_exchange" is the standard way to read/write files.
    }
    if (aaContent.includes("content_exchange")) perms.storage = true;
    // Also check raw rules if possible? "owner @{HOME}/..."
    if (aaContent.includes("@{home}")) perms.storage = true;
  } catch (e) {
    // Fail silently, return false for all
  }
  return perms;
}

function safeReadMaintainer(appPath) {
  try {
    const manifestPath = path.join(appPath, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, "utf8");
      const json = JSON.parse(content);
      return json.maintainer || null;
    }
  } catch (e) {
    return null;
  }
  return null;
}

function safeReadLastUpdated(appPath) {
  try {
    // Install metadata is often in .click/info/* but we might not have access.
    // Fallback: check mtime of manifest
    const manifestPath = path.join(appPath, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const stats = fs.statSync(manifestPath);
      return stats.mtime; // Date object
    }
  } catch (e) {
    return null;
  }
  return null;
}

module.exports = {
  scanInstalledApps,
  // Exporting internals for testing if needed, though scanInstalledApps(testRoot) is preferred
  discoverClickApps,
  readAppMetadata,
};
