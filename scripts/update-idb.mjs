import { promises as fs } from 'fs';
import path from 'path';
import { createHash } from 'crypto';

async function main() {
  // Determine installed idb version from node_modules
  const idbPkgPath = new URL('../node_modules/idb/package.json', import.meta.url);
  const idbPkg = JSON.parse(await fs.readFile(idbPkgPath, 'utf8'));
  const version = idbPkg.version;

  // Read UMD build from installed package
  const idbUmdPath = path.resolve('node_modules', 'idb', 'build', 'umd.js');
  const content = await fs.readFile(idbUmdPath, 'utf8');

  // Ensure vendor directory exists
  const vendorDir = path.resolve('public', 'vendor');
  await fs.mkdir(vendorDir, { recursive: true });

  // Remove old idb files
  const files = await fs.readdir(vendorDir);
  await Promise.all(
    files
      .filter(f => f.startsWith('idb-') && f !== `idb-${version}.min.js`)
      .map(f => fs.unlink(path.join(vendorDir, f)))
  );

  const filePath = path.join(vendorDir, `idb-${version}.min.js`);
  await fs.writeFile(filePath, content);

  // Compute SRI hash
  const hash = createHash('sha384').update(content).digest('base64');
  const sri = `sha384-${hash}`;

  // Update sw.js importScripts line
  const swPath = path.resolve('public', 'sw.js');
  let sw = await fs.readFile(swPath, 'utf8');
  sw = sw.replace(/importScripts\(["'].*index-min\.js["']\)/, `importScripts("/vendor/idb-${version}.min.js")`);
  await fs.writeFile(swPath, sw);

  // Write idb-info.ts
  const infoPath = path.resolve('src', 'lib', 'idb-info.ts');
  const infoContent = `export const IDB_VERSION = '${version}';\nexport const IDB_SRI = '${sri}';\n`;
  await fs.writeFile(infoPath, infoContent);

  console.log(`idb ${version} downloaded to ${filePath}`);
  console.log(`SRI: ${sri}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
