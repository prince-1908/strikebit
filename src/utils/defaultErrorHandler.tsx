import { toast } from "react-toastify";
import { handleBackendError } from "@/services/backend-errors/backendErrorHandling";

const isBrowser = typeof window !== "undefined";

export const defaultErrorHandler = (
  error: any,
  toastPrefix: string = ""
) => {
  console.error(error);
  if (isBrowser) {
    const backendError = handleBackendError(error)!;
    toast.error(toastPrefix + (backendError.message ?? error.message));
  }
}