import { ApiServices, createApiServices } from "./createApiServices";

const isBrowser = typeof window !== "undefined";

const clientApiServices =
  isBrowser ?
    createApiServices() :
    {} as ApiServices;

export default clientApiServices;