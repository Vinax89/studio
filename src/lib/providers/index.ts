import type { TransactionRowType } from "@/lib/transactions"
import { mapPlaidTransactions } from "./plaid"
import { mapFinicityTransactions } from "./finicity"

export type ProviderMapper = (txs: unknown[]) => TransactionRowType[]

const mappers: Record<string, ProviderMapper> = {
  plaid: mapPlaidTransactions,
  finicity: mapFinicityTransactions,
}

export function getProviderMapper(provider: string): ProviderMapper {
  const mapper = mappers[provider]
  if (!mapper) {
    throw new Error(`Unsupported provider: ${provider}`)
  }
  return mapper
}
