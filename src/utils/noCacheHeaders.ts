import { RawAxiosRequestHeaders } from "axios";

const noCacheHeaders : RawAxiosRequestHeaders = {
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export default noCacheHeaders;