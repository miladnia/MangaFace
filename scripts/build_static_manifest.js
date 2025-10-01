import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import YAML from 'yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_DIR = path.resolve(__dirname, '..');
const CONFIG_FILE = path.join(APP_DIR, 'config/app.yaml');
const NODE_ENV = process.env.NODE_ENV;

// Load .env variables
dotenv.config({ path: path.join(APP_DIR, '.env') });
const prodEnvPath = path.join(APP_DIR, '.env.production');
if ('production' === NODE_ENV && fs.existsSync(prodEnvPath)) {
  dotenv.config({ path:prodEnvPath, override: true });
} else {
  console.warn('The file \'.env.production\' does NOT exist.');
}

// --- Step 1: Load config file ---
let config;
try {
  const configContent = fs.readFileSync(CONFIG_FILE, 'utf8');
  config = YAML.parse(configContent);
} catch (err) {
  console.error(
    '✘ [ERROR] Could not parse the config file:\n',
    CONFIG_FILE,
    '\n',
    err.message
  );
  process.exit(1);
}

const BASE_URL =
  (process.env.STATIC_BASE_URL ?? '') +
  (config?.static_manifest_assets_path ?? '');

// --- Step 2: Scan manifest directory ---
const manifestDir = path.join(APP_DIR, config?.manifest_dir ?? '');
let manifestFiles;
try {
  manifestFiles = fs
    .readdirSync(manifestDir)
    .filter(
      (name) =>
        fs.statSync(path.join(manifestDir, name)).isFile() &&
        name.endsWith('.yaml')
    );
} catch {
  console.error('✘ [ERROR] Could not read manifest directory:', manifestDir);
  process.exit(1);
}

for (const file of manifestFiles) {
  // --- Step 3: Parse manifests ---
  const filename = path.join(manifestDir, file);
  let manifestContent = fs.readFileSync(filename, 'utf8');

  // Replace <BASE_URL> placeholder
  manifestContent = manifestContent.replace(/<BASE_URL>/g, BASE_URL);

  let parsedManifest = '';

  try {
    parsedManifest = YAML.parse(manifestContent);
  } catch (err) {
    console.error(
      '✘ [ERROR] Could not parse the manifest:\n',
      filename,
      '\n',
      err.message
    );
    process.exit(1);
  }

  // --- Step 4: Prepare output directory ---
  const staticManifestDir = path.join(
    APP_DIR,
    config?.static_manifest_dir ?? ''
  );

  if (!fs.existsSync(staticManifestDir)) {
    fs.mkdirSync(staticManifestDir, { recursive: true });
  }

  // --- Step 5: Serialize JSON ---
  const PRETTY_JSON = process.env.PRETTY_JSON ?? config?.pretty_json ?? true;

  const jsonData = JSON.stringify(
    parsedManifest,
    null,
    PRETTY_JSON === true || PRETTY_JSON === 'true' ? 2 : undefined
  );

  // --- Step 6: Write output file ---
  const staticManifestFile = path.join(
    staticManifestDir,
    `${path.parse(file).name}.json`
  );
  try {
    fs.writeFileSync(staticManifestFile, jsonData);
  } catch {
    console.error('✘ [ERROR] Could not write to the file:', staticManifestFile);
    process.exit(1);
  }

  console.log('Manifest created:', staticManifestFile);
}
