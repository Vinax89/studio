import { writeFileSync } from 'fs';
import { join } from 'path';

interface RawRow {
  GeoName: string;
  DataValue: string;
}

async function fetchRpp(year: number, apiKey: string) {
  const url = `https://apps.bea.gov/api/data/?UserID=${apiKey}&method=GetData&dataset=RegionalPriceParities&TableName=RPP&LineCode=1&GeoFIPS=STATE&Year=${year}&ResultFormat=JSON`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  const data = await res.json();
  return data.BEAAPI.Results.Data as RawRow[];
}

async function main() {
  const year = new Date().getFullYear();
  const apiKey = process.env.BEA_API_KEY || 'DEMO';
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
  }, {} as Record<string, any>);

  const content = `export const costOfLiving${year} = {\n  baseYear: ${year},\n  source: 'BEA Regional Price Parities',\n  regions: ${JSON.stringify(regions, null, 2)}\n} as const;\n`;
  const target = join(__dirname, '..', 'src', 'data', `costOfLiving${year}.ts`);
  writeFileSync(target, content);
  console.log(`Updated dataset for ${year}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
