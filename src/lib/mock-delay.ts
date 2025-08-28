export function shouldDelay() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ENABLE_MOCK_DELAY === "true"
  );
}
