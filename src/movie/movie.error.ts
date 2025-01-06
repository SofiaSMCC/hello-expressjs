import { CustomError } from "../types/error";

export function throwError(message: string, status: number): never {
  const error: CustomError = new Error(message);
  error.status = status;
  throw error;
}
