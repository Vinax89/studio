# Cost of Living Dataset

This project derives metropolitan cost-of-living multipliers from the [Bureau of Economic Analysis (BEA) Regional Price Parities](https://www.bea.gov/data/prices-inflation/regional-price-parities-rpps).

## Updating the dataset

Run the update script annually after BEA releases new RPP figures:

```bash
pnpm dlx ts-node scripts/update-cost-of-living.ts
```

The script downloads the latest BEA data and regenerates `src/data/costOfLivingYYYY.ts` with RPP multipliers for every U.S. metropolitan statistical area.

## Using the data

Import the generated dataset and look up a metro's multiplier to adjust baseline living costs:

```ts
import { costOfLiving2024 } from '@/data/costOfLiving2024';
const seattle = costOfLiving2024.metros['Seattle-Tacoma-Bellevue, WA (Metropolitan Statistical Area)'];
console.log(seattle.rpp);
```
