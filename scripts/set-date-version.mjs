import { readFileSync, writeFileSync } from 'node:fs';

const today = new Date();
const displayVersion = `${today.getUTCFullYear()}.${today.getUTCMonth() + 1}.${today.getUTCDate()}`;
const bundleVersion = `${String(today.getUTCFullYear()).slice(-2)}.${today.getUTCMonth() + 1}.${today.getUTCDate()}`;

function read(path) {
  return readFileSync(path, 'utf8');
}

function write(path, content) {
  writeFileSync(path, content);
}

function updateJson(path, updater) {
  const data = JSON.parse(read(path));
  updater(data);
  write(path, `${JSON.stringify(data, null, 2)}\n`);
}

function replace(path, pattern, replacement) {
  const before = read(path);
  if (!pattern.test(before)) {
    throw new Error(`Pattern not found in ${path}`);
  }
  const after = before.replace(pattern, replacement);
  write(path, after);
}

updateJson('package.json', (data) => {
  data.version = bundleVersion;
});

updateJson('package-lock.json', (data) => {
  data.version = bundleVersion;
  if (data.packages?.['']) {
    data.packages[''].version = bundleVersion;
  }
});

updateJson('src-tauri/tauri.conf.json', (data) => {
  data.version = bundleVersion;
});

replace('src-tauri/Cargo.toml', /^version = ".*"$/m, `version = "${bundleVersion}"`);
replace(
  'src-tauri/Cargo.lock',
  /name = "CheatSheet"\nversion = ".*"/,
  `name = "CheatSheet"\nversion = "${bundleVersion}"`
);
replace(
  'src/lib/version.ts',
  /export const APP_VERSION = '.*';/,
  `export const APP_VERSION = '${displayVersion}';`
);

console.log(`Set bundle version to ${bundleVersion}`);
console.log(`Set display version to ${displayVersion}`);
