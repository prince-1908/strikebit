import { NextApiRequest, NextApiResponse } from "next";
import httpProxyMiddleware, { NextHttpProxyMiddlewareOptions } from "next-http-proxy-middleware";
import { HttpStatusCode } from "axios";
import router from "next/router";
import { routes } from "@/data/routes";

const baseConfig = {
  api: {
    externalResolver: true,
    bodyParser: false,
  }
}

const GatewayTimeoutErrorCodes = [
  "ECONNREFUSED",
  "ETIMEDOUT",
  "ECONNRESET",
]

const handleProxyInit: NextHttpProxyMiddlewareOptions["onProxyInit"] = (proxy) => {
  proxy.on("proxyReq", async (proxyReq, req, res) => {
    let idToken: string | null = null;
    try {
      /*let session = await auth0Instance.getSession(req, res);
      if (session != null) {
        idToken = session.idToken!;
        let expired = isIdTokenExpired(idToken);
        if (expired) {
          console.log("idToken expired, try refresh");
          try {
            idToken = await refreshToken(req, res);
          } catch (e) {
            await router.push(routes.auth.logout());
            return;
          }
        }
      }*/
    } catch (err) {
      await router.push(routes.auth.logout());
      return;
    }

    if (idToken) {
      proxyReq.setHeader('Authorization', `Bearer ${idToken}`)
    }
  });

  proxy.on("error", (err, _, res) => {
    const errCode = (err as any).code;
    console.log(err);

    let statusCode: HttpStatusCode;
    if (GatewayTimeoutErrorCodes.indexOf(errCode) != -1) {
      statusCode = HttpStatusCode.GatewayTimeout;
    } else {
      switch (errCode) {
        default:
          statusCode = HttpStatusCode.BadGateway;
          break;
      }
    }

    if (statusCode) {
      res.writeHead(statusCode, []);
    }
    res.end()
  });
};

const createHandler = (target: string, pattern: string, changeOrigin: boolean = true) => {
  return async (
    req: NextApiRequest,
    res: NextApiResponse
  ) => {
    await httpProxyMiddleware(req, res, {
      target: target,
      changeOrigin: changeOrigin,
      pathRewrite: [{
        patternStr: pattern,
        replaceStr: "/"
      }],
      onProxyInit: handleProxyInit,
      timeout: 20 * 60 * 1000, // 20 minutes
      proxyTimeout: 20 * 60 * 1000, // 20 minutes,
    })
  };
}

const apiProxy = {
  createHandler,
  baseConfig: baseConfig
}

export default apiProxy