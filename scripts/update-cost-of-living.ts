import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { tmpdir } from 'os';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

interface MetroRpp { rpp: number; }

const __dirname = dirname(fileURLToPath(import.meta.url));

function parseCsvLine(line: string): string[] {
  const result: string[] = []; let current = ''; let inQuotes = false;
  for (const c of line) {
    if (c === '"') { inQuotes = !inQuotes; }
    else if (c === ',' && !inQuotes) { result.push(current); current = ''; }
    else { current += c; }
  }
  result.push(current);
  return result.map((s) => s.trim().replace(/^"|"$/g, ''));
}

function downloadRppCsv(): string {
  const url = 'https://apps.bea.gov/regional/zip/RPP.zip';
  const zipPath = join(tmpdir(), 'RPP.zip');
  execSync(`curl -L -o "${zipPath}" ${url}`);
  return execSync(`unzip -p "${zipPath}" MARPP_MSA_2008_2023.csv`, { encoding: 'utf-8' });
}

async function main() {
  const csv = downloadRppCsv();
  const lines = csv.trim().split(/\r?\n/);
  const header = parseCsvLine(lines[0]);
  const yearCols = header.filter((h) => /^\d{4}$/.test(h));
  const rppYear = Number(yearCols[yearCols.length - 1]);
  const datasetYear = rppYear + 1;
  const baseYear = datasetYear + 1;
  const metros: Record<string, MetroRpp> = {};
  for (let i = 1; i < lines.length; i++) {
    const cols = parseCsvLine(lines[i]);
    if (cols[4] === '3') { // LineCode 3: RPPs, all items
      const name = cols[1];
      const value = Number(cols[cols.length - 1]);
      if (!Number.isNaN(value)) {
        metros[name] = { rpp: value / 100 };
      }
    }
  }
  const content = `export interface MetroCost { rpp: number; }\nexport interface CostOfLivingDataset { baseYear: number; source: string; metros: Record<string, MetroCost>; }\nexport const costOfLiving${datasetYear} : CostOfLivingDataset = {\n  baseYear: ${baseYear},\n  source: 'BEA Regional Price Parities ${rppYear}',\n  metros: ${JSON.stringify(metros, null, 2)}\n} as const;\n\nexport type MetroArea = keyof typeof costOfLiving${datasetYear}.metros;\n`;
  const dir = join(__dirname, '..', 'src', 'data');
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const target = join(dir, `costOfLiving${datasetYear}.ts`);
  writeFileSync(target, content);
  console.info(`Updated dataset for ${datasetYear}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
