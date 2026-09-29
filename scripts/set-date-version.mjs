import { readFileSync, writeFileSync } from 'node:fs';

const today = new Date();
const version = `${today.getUTCFullYear()}.${today.getUTCMonth() + 1}.${today.getUTCDate()}`;

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
  const after = before.replace(pattern, replacement);
  if (before === after) {
    throw new Error(`No change made in ${path}`);
  }
  write(path, after);
}

updateJson('package.json', (data) => {
  data.version = version;
});

updateJson('package-lock.json', (data) => {
  data.version = version;
  if (data.packages?.['']) {
    data.packages[''].version = version;
  }
});

updateJson('src-tauri/tauri.conf.json', (data) => {
  data.version = version;
});

replace('src-tauri/Cargo.toml', /^version = ".*"$/m, `version = "${version}"`);
replace(
  'src-tauri/Cargo.lock',
  /name = "CheatSheet"\nversion = ".*"/,
  `name = "CheatSheet"\nversion = "${version}"`
);
replace(
  'src/lib/version.ts',
  /export const APP_VERSION = '.*';/,
  `export const APP_VERSION = '${version}';`
);

console.log(`Set app version to ${version}`);
