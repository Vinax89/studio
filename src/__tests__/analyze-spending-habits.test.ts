/**
 * @jest-environment node
 */
jest.mock("@/ai/genkit", () => ({
  ai: {
    definePrompt: jest.fn(),
    defineFlow: jest.fn((_c: any, handler: any) => handler),
  },
}));
import { AnalyzeSpendingHabitsInputSchema, MAX_DOCUMENT_SIZE, MAX_FINANCIAL_DOCUMENTS } from "@/ai/flows/analyze-spending-habits";

const validDoc = "data:text/plain;base64," + Buffer.from("test").toString("base64");

describe("AnalyzeSpendingHabitsInputSchema", () => {
  it("rejects invalid document string", () => {
    const input = { financialDocuments: ["not-a-data-uri"], userDescription: "desc", goals: [] };
    expect(() => AnalyzeSpendingHabitsInputSchema.parse(input)).toThrow();
  });

  it("rejects oversized document string", () => {
    const largeDoc = "data:text/plain;base64," + "a".repeat(MAX_DOCUMENT_SIZE + 1);
    const input = { financialDocuments: [largeDoc], userDescription: "desc", goals: [] };
    expect(() => AnalyzeSpendingHabitsInputSchema.parse(input)).toThrow();
  });

  it("rejects too many documents", () => {
    const docs = Array(MAX_FINANCIAL_DOCUMENTS + 1).fill(validDoc);
    const input = { financialDocuments: docs, userDescription: "desc", goals: [] };
    expect(() => AnalyzeSpendingHabitsInputSchema.parse(input)).toThrow();
  });
});
