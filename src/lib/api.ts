import { errorResponse } from "./http";
import { requireAdmin, requireCustomer } from "./auth";

export async function handle<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (error) {
    const status = (error as { status?: number }).status || 400;
    const message = error instanceof Error ? error.message : "Request failed";
    return errorResponse(message, status);
  }
}

export async function adminApi<T>(fn: () => Promise<T>) {
  return handle(async () => {
    await requireAdmin();
    return fn();
  });
}

export async function customerApi<T>(fn: () => Promise<T>) {
  return handle(async () => {
    await requireCustomer();
    return fn();
  });
}
