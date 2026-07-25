export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  if (typeof error === "string" && error) return error;
  return fallback;
}

export function getTransactionErrorMessage(error: unknown) {
  const message = getErrorMessage(error, "Transaction failed.");
  if (/user rejected|rejected request|denied|cancelled/i.test(message)) {
    return "Transaction cancelled by user.";
  }
  if (/revert|execution reverted/i.test(message)) {
    return "Transaction failed or reverted.";
  }
  return message;
}
