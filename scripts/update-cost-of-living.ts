import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

interface RawRow {
  GeoName: string;
  DataValue: string;
}

interface RegionCostBreakdown {
  housing: number;
  groceries: number;
  utilities: number;
  transportation: number;
  healthcare: number;
  miscellaneous: number;
}

async function fetchRpp(year: number, apiKey: string) {
  const url = `https://apps.bea.gov/api/data/?UserID=${apiKey}&method=GetData&dataset=RegionalPriceParities&TableName=RPP&LineCode=1&GeoFIPS=STATE&Year=${year}&ResultFormat=JSON`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`Request failed: ${res.status}`);
    }
    const data = await res.json();
    const rows = data?.BEAAPI?.Results?.Data;
    if (
      !Array.isArray(rows) ||
      !rows.every(
        (r: any) =>
          typeof r.GeoName === 'string' && typeof r.DataValue === 'string'
      )
    ) {
      throw new Error('Unexpected response format');
    }
    return rows as RawRow[];
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  const year = new Date().getFullYear();
  const apiKey = process.env.BEA_API_KEY;
  if (!apiKey) {
    throw new Error('BEA_API_KEY environment variable is required');
  }
  const dryRun = process.argv.includes('--dry-run');
  const rows = await fetchRpp(year, apiKey);
  const regions = rows.reduce((acc, row) => {
    const index = Number(row.DataValue.replace(/,/g, '')) / 100; // convert index to multiplier
    acc[row.GeoName] = {
      housing: index * 20000,
      groceries: index * 5000,
      utilities: index * 3000,
      transportation: index * 6000,
      healthcare: index * 5000,
      miscellaneous: index * 4000,
    };
    return acc;
  }, {} as Record<string, RegionCostBreakdown>);

  const content = `export const costOfLiving${year} = {\n  baseYear: ${year},\n  source: 'BEA Regional Price Parities',\n  regions: ${JSON.stringify(regions, null, 2)}\n} as const;\n`;
  const dir = join(__dirname, '..', 'src', 'data');
  if (!existsSync(dir)) {
    if (dryRun) {
      console.info(`Dry run - would create directory ${dir}`);
    } else {
      mkdirSync(dir, { recursive: true });
    }
  }
  const target = join(dir, `costOfLiving${year}.ts`);
  if (dryRun) {
    console.info(`Dry run - would write to ${target}:\n${content}`);
  } else {
    writeFileSync(target, content);
    console.info(`Updated dataset for ${year}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
