/**
 * @jest-environment node
 */
import { POST as importPost } from "@/app/api/bank/import/route"
import { POST as syncPost } from "@/app/api/transactions/sync/route"
import { verifyFirebaseToken } from "@/lib/server-auth"

jest.mock("@/lib/server-auth", () => ({
  verifyFirebaseToken: jest.fn().mockResolvedValue(undefined),
}))

describe("payload size limits", () => {
  const MAX_BODY_SIZE = 1024 * 1024

  function oversizedRequest() {
    let bodyRead = false
    const req: any = new Request("http://localhost", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": String(MAX_BODY_SIZE + 1),
      },
      body: "{}",
    })
    req.text = () => {
      bodyRead = true
      return Promise.resolve("{}")
    }
    return { req: req as Request, wasRead: () => bodyRead }
  }

  beforeEach(() => {
    ;(verifyFirebaseToken as jest.Mock).mockClear()
  })

  it("bank/import rejects oversized payload without reading body", async () => {
    const { req, wasRead } = oversizedRequest()
    const res = await importPost(req)
    expect(res.status).toBe(413)
    expect(wasRead()).toBe(false)
    expect(verifyFirebaseToken).toHaveBeenCalledTimes(1)
  })

  it("transactions/sync rejects oversized payload without reading body", async () => {
    const { req, wasRead } = oversizedRequest()
    const res = await syncPost(req)
    expect(res.status).toBe(413)
    expect(wasRead()).toBe(false)
    expect(verifyFirebaseToken).toHaveBeenCalledTimes(1)
  })
})
