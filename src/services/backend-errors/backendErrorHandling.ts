import { AxiosError } from "axios";

import { getReasonPhrase, StatusCodes, } from 'http-status-codes';
import { BackendError, BackendErrorResponse, IBackendErrorResponseDto } from "./backend-errors";

type HandlerReturnType = BackendError | null | void;
type HandlerFunctionType = (() => HandlerReturnType) | ((errorResponse: BackendErrorResponse) => HandlerReturnType);

type StatusCodeToHandler = {
  [key: number]: HandlerFunctionType;
};

const DefaultErrorHandlers: StatusCodeToHandler = {
  ...Object.keys(StatusCodes).reduce((acc: any, elem: string) => {
    const code = Number(elem);
    if (isNaN(code))
      return acc;

    acc[elem] = () => new BackendError(`Unexpected server error '${code} ${getReasonPhrase(code)}', please try again later`);
    return acc;
  }, {}),
  401: () => new BackendError("Unauthorized action"),
  403: () => new BackendError("Access denied"),
}

export function createDefaultBackendError(errorResponse: BackendErrorResponse) {
  return new BackendError(
    errorResponse.getFirstError(errorResponse.message ?? getReasonPhrase(errorResponse.statusCode)),
    errorResponse.statusCode,
    errorResponse.errors
  );
}

export function handleBackendErrorOptional(
  rawError: any,
  httpErrorHandlers?: StatusCodeToHandler,
  unexpectedHttpErrorHandler?: HandlerFunctionType,
  networkErrorHandler?: () => HandlerReturnType
): BackendError | null {
  if (rawError instanceof BackendError) return rawError;

  if (!rawError.isAxiosError)
    return new BackendError("Unknown error: " + rawError.message);

  const axiosError = rawError as AxiosError;
  const isNetworkError =
    axiosError.code == AxiosError.ERR_NETWORK ||
    axiosError.code == AxiosError.ECONNABORTED ||
    axiosError.code == AxiosError.ERR_CANCELED ||
    axiosError.code == AxiosError.ERR_FR_TOO_MANY_REDIRECTS ||
    axiosError.code == AxiosError.ETIMEDOUT ||
    axiosError.code == "ECONNREFUSED";

  httpErrorHandlers = {
    ...httpErrorHandlers
  };

  networkErrorHandler =
    networkErrorHandler ||
    (() => new BackendError(`Network error, please check your Internet connection`));

  if (isNetworkError) {
    const handlerResult = networkErrorHandler();
    return handlerResult || null;
  }

  const httpStatusCode = axiosError.response!.status;
  const httpErrorHandler = httpErrorHandlers[httpStatusCode];

  let errorResponseDto: IBackendErrorResponseDto | null = null;
  let errorResponse: BackendErrorResponse | null;
  let hasErrorResponse = false;
  try {
    errorResponseDto = JSON.parse(JSON.stringify(axiosError.response?.data)) as IBackendErrorResponseDto;
    if (!errorResponseDto || typeof errorResponseDto !== "object") {
      throw new Error("Failed to parse error response");
    }

    errorResponse = new BackendErrorResponse(httpStatusCode, errorResponseDto.errors ?? [], errorResponseDto.message);
    hasErrorResponse = true;
  } catch (error: any) {
    errorResponse = new BackendErrorResponse(httpStatusCode, []);
  }

  let handlerResult;

  if (httpErrorHandler) {
    handlerResult = httpErrorHandler(errorResponse);
  } else {
    //console.warn(`Unexpected HTTP status code`, axiosError)
    unexpectedHttpErrorHandler =
      unexpectedHttpErrorHandler ||
      (() => {
        if (hasErrorResponse) {
          return createDefaultBackendError(errorResponse!);
        } else {
          return DefaultErrorHandlers[httpStatusCode](errorResponse!);
        }
      });

    handlerResult = unexpectedHttpErrorHandler(errorResponse);
  }

  return handlerResult || null;
}

export function handleBackendError(
  rawError: any,
  httpErrorHandlers?: StatusCodeToHandler,
  unexpectedHttpErrorHandler?: HandlerFunctionType,
  networkErrorHandler?: () => HandlerReturnType
): BackendError {
  const errorResult = handleBackendErrorOptional(rawError, httpErrorHandlers, unexpectedHttpErrorHandler, networkErrorHandler);
  if (!errorResult) {
    console.warn("Handling error returned no value, this shouldn't happen", rawError);
  }
  return errorResult!;
}

export function handleBackendErrorThrow(
  rawError: any,
  httpErrorHandlers?: StatusCodeToHandler,
  unexpectedHttpErrorHandler?: HandlerFunctionType,
  networkErrorHandler?: () => HandlerReturnType
): never {
  throw handleBackendError(rawError, httpErrorHandlers, unexpectedHttpErrorHandler, networkErrorHandler);
}