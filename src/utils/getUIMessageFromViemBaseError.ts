import { BaseError } from "viem";

export function getUIMessageFromViemBaseError(error: BaseError) {
  if (error.shortMessage.startsWith("An unknown RPC error occurred."))
    return error.details;

  if (error.details)
    return `${error.shortMessage} (${error.details})`;

  return error.shortMessage;
}