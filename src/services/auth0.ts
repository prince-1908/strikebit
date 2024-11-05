import { NextApiRequest, NextApiResponse } from "next";
import { IncomingMessage } from "node:http";
import { ServerResponse } from "http";
import { getAccessToken, initAuth0, Session } from "@auth0/nextjs-auth0";

export const auth0Instance = initAuth0({
  baseURL: process.env.AUTH0_BASE_URL,
  session: {
    // https://github.com/auth0/nextjs-auth0/issues/616
    rolling: false,
    autoSave: false,

    rollingDuration: false,
  }
});

export const refreshToken = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  let idToken: string = null!;
  const afterRefresh = async (
    req: NextApiRequest | IncomingMessage,
    res: NextApiResponse | ServerResponse,
    session: Session
  ) => {
    await auth0Instance.updateSession(req, res, session);
    idToken = session.idToken!;
    return session;
  };

  await getAccessToken(req, res, {
    refresh: true,
    afterRefresh: afterRefresh
  });

  return idToken;
};

export const isIdTokenExpired = (idToken: string) => {
  const payloadBase64 = idToken.split(".")[1];
  const decodedJson = Buffer.from(payloadBase64, "base64").toString();
  const decoded = JSON.parse(decodedJson);
  const exp = decoded.exp;
  const expired = Date.now() >= exp * 1000;
  return expired;
};
