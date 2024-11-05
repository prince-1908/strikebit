import { auth0Instance } from "@/services/auth0";
import { AppRouteHandlerFnContext, Session } from "@auth0/nextjs-auth0";
import { NextRequest } from "next/server";
import { deleteCookie, setCookie } from "cookies-next";
import { NextApiRequest, NextApiResponse } from "next";

const idTokenCookieName = "appIdToken";

function afterCallback(
  req: NextApiRequest,
  res: NextApiResponse,
  session: Session,
  state?: { [key: string]: any }
) {
  if (session != null) {
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 7);

    setCookie(idTokenCookieName, session.idToken, {
      req,
      res,
      httpOnly: true,
      sameSite: "lax",
      expires: expireDate,
    })
  }

  return session;
}

export default auth0Instance.handleAuth({
  callback: async (req: NextRequest, res: AppRouteHandlerFnContext) => {
    return auth0Instance.handleCallback(req, res, {afterCallback: afterCallback});
  },

  logout: async (req: NextRequest, res: AppRouteHandlerFnContext) => {
    deleteCookie(idTokenCookieName, {req, res: res as any as Response})
    return auth0Instance.handleLogout(req, res);
  }
});
