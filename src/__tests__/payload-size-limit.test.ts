/**
 * @jest-environment node
 */
import { Readable } from "stream"
import { POST as bankImport } from "@/app/api/bank/import/route"
import { POST as transactionsSync } from "@/app/api/transactions/sync/route"

const MAX_BODY_SIZE = 1024 * 1024

function createOversizedRequest() {
  let read = false
  const stream = new Readable({
    read() {
      read = true
      this.push("a")
      this.push(null)
    },
  })
  const init: RequestInit & { duplex: "half" } = {
    method: "POST",
    headers: {
      Authorization: "Bearer test-token",
      "content-length": String(MAX_BODY_SIZE + 1),
    },
    body: stream,
    // Node's Request type requires duplex when using a stream body
    duplex: "half",
  }
  const req = new Request("http://localhost", init)
  return { req, read: () => read }
}

describe("payload size limits", () => {
  it("rejects oversized /api/bank/import payload without reading body", async () => {
    const { req, read } = createOversizedRequest()
    const res = await bankImport(req)
    expect(res.status).toBe(413)
    expect(read()).toBe(false)
  })

  it("rejects oversized /api/transactions/sync payload without reading body", async () => {
    const { req, read } = createOversizedRequest()
    const res = await transactionsSync(req)
    expect(res.status).toBe(413)
    expect(read()).toBe(false)
  })
})
