import React from "react"
import { renderToString } from "react-dom/server"
import { handleError } from "../lib/error-helper"
import { useErrorHandler } from "../hooks/use-error-handler"

const toastMock = jest.fn()

jest.mock("../hooks/use-toast", () => ({
  useToast: () => ({ toast: toastMock })
}))

describe("handleError", () => {
  it("logs and returns sanitized message", () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
    const result = handleError(new Error("test"), "testing")
    expect(errorSpy).toHaveBeenCalled()
    expect(result).toBe("An unexpected error occurred")
    errorSpy.mockRestore()
  })
})

describe("useErrorHandler", () => {
  it("triggers toast with overrides", () => {
    function TestComponent() {
      const onError = useErrorHandler()
      onError(new Error("boom"), {
        context: "Testing",
        title: "Custom title",
        description: "Custom description",
      })
      return null
    }
    renderToString(React.createElement(TestComponent))
    expect(toastMock).toHaveBeenCalledWith({
      title: "Custom title",
      description: "Custom description",
      variant: "destructive",
    })
  })
})
