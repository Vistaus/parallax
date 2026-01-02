/**
 * @file appScanner.js
 * @description Enumerates installed Ubuntu Touch applications (read-only).
 * @frozen v1
 */

// Shim for fs and path in QML
var fs = {
    existsSync: function(p) { console.warn("fs.existsSync shim called for " + p); return false; },
    readdirSync: function(p) { return []; },
    readFileSync: function(p) { return ""; },
    statSync: function(p) { return { mtime: new Date() }; }
};

var path = {
    join: function() { 
        var parts = [];
        for (var i=0; i<arguments.length; i++) parts.push(arguments[i]);
        return parts.join("/"); 
    },
    dirname: function(p) { return p.substring(0, p.lastIndexOf("/")); },
    basename: function(p) { return p.substring(p.lastIndexOf("/") + 1); },
    isAbsolute: function(p) { return p.startsWith("/"); }
};

// Known locations for Click apps
const CLICK_APP_DIR = "/opt/click.ubuntu.com";

/**
 * Main entry point.
 * Returns a list of RawAppMetadata objects.
 * @param {string} [overrideRoot] - Optional override for testing (mocking /opt)
 * @returns {Array<Object>}
 */
function scanInstalledApps(overrideRoot) {
  const apps = [];
  const searchRoot = overrideRoot || CLICK_APP_DIR;

  try {
    const clickApps = discoverClickApps(searchRoot);
    for (var i = 0; i < clickApps.length; i++) {
      var app = clickApps[i];
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

    for (var i = 0; i < packages.length; i++) {
      var pkg = packages[i];
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
    // Shim fs.readdirSync returns []
    const desktopFiles = fs.readdirSync(appPath);
    // .filter is OK if array is empty
    const filtered = [];
    for(var k=0; k<desktopFiles.length; k++) {
        if(desktopFiles[k].endsWith(".desktop")) filtered.push(desktopFiles[k]);
    }
    
    if (filtered.length > 0) {
      const dPath = path.join(appPath, filtered[0]);
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
    const desktopFiles = fs.readdirSync(appPath);
    const filtered = [];
    for(var k=0; k<desktopFiles.length; k++) {
        if(desktopFiles[k].endsWith(".desktop")) filtered.push(desktopFiles[k]);
    }

    if (filtered.length > 0) {
      const dPath = path.join(appPath, filtered[0]);
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
  try {
    const manifestPath = path.join(appPath, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      const content = fs.readFileSync(manifestPath, "utf8");
      const json = JSON.parse(content);

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
    const aaFiles = fs.readdirSync(appPath);
    const filtered = [];
    for(var k=0; k<aaFiles.length; k++) {
        if(aaFiles[k].endsWith(".apparmor")) filtered.push(aaFiles[k]);
    }

    if (filtered.length > 0) {
      const aaPath = path.join(appPath, filtered[0]);
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

  return "strict"; 
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
    const aaFiles = fs.readdirSync(appPath);
    const filtered = [];
    for(var k=0; k<aaFiles.length; k++) {
        if(aaFiles[k].endsWith(".apparmor")) filtered.push(aaFiles[k]);
    }

    if (filtered.length > 0) {
      aaContent = fs
        .readFileSync(path.join(appPath, filtered[0]), "utf8")
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
    if (aaContent.includes("networking")) perms.network = true;
    if (aaContent.includes("camera")) perms.camera = true;
    if (aaContent.includes("audio") || aaContent.includes("microphone"))
      perms.microphone = true;
    if (aaContent.includes("location")) perms.location = true;
    if (
      aaContent.includes("content_exchange") ||
      aaContent.includes("content_hub") ||
      aaContent.includes("keep-display-on")
    ) {
    }
    if (aaContent.includes("content_exchange")) perms.storage = true;
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
