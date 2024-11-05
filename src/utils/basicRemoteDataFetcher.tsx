import { type AxiosRequestConfig, AxiosResponse } from "axios";
import { defaultErrorHandler } from "./defaultErrorHandler";
import { ApiServices } from "@/services/createApiServices";

export type RemoteDataFetcherFn<T> = (
  apiServices: ApiServices,
  existing: T | null,
  onSuccess?: ((affiliateCode: T) => void) | null,
  options?: AxiosRequestConfig
) => Promise<T | null>

export async function basicRemoteDataFetcher<T>(
  apiServices: ApiServices,
  existing: T | null,
  fetchFn: (apiServices: ApiServices, options?: AxiosRequestConfig) => Promise<AxiosResponse<T, any>>,
  onSuccess?: ((affiliateCode: T) => void) | null,
  options?: AxiosRequestConfig
) {
  if (existing)
    return existing;

  try {
    const response = await fetchFn(apiServices, options);
    if (onSuccess) {
      onSuccess(response.data);
    }
    // @ts-ignore
    return response.data;
  } catch (e: any) {
    defaultErrorHandler(e);
    return null;
  }
}

export function basicRemoteDataFetcherFn<T>(
  fetchFn: (apiServices: ApiServices, options?: AxiosRequestConfig) => Promise<AxiosResponse<T, any>>
) {
  const result: RemoteDataFetcherFn<T> = (apiServices, existing, onSuccess, options) => {
    return basicRemoteDataFetcher(apiServices, existing, fetchFn, onSuccess, options);
  }

  return result;
}