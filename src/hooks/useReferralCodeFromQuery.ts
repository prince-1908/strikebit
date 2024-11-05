import { useSearchParams } from "next/navigation";
import { OptionsType } from "cookies-next/lib/types";
import { getCookie, setCookie } from "cookies-next";
import { useEffect, useState } from "react";

const cookieName = "distribrain.refcode";
const codeDurationHours = 48;

export default function useReferralCodeFromQuery() {
  const [loaded, setLoaded] = useState(false);
  const [referralCode, setReferralCode] = useState<string | null>();
  const searchParams = useSearchParams();

  useEffect(() => {
    let affiliateCodeQueryParam: string | null = searchParams.get("eref");
    if (!affiliateCodeQueryParam || affiliateCodeQueryParam.length < 3) {
      affiliateCodeQueryParam = null;
    }

    if (affiliateCodeQueryParam) {
      const cookieExpiresAt = new Date();
      cookieExpiresAt.setTime(cookieExpiresAt.getTime() + codeDurationHours * 60 * 60 * 1000);

      const setCookieOptions: OptionsType = {
        sameSite: "lax",
        expires: cookieExpiresAt,
      };

      setCookie(cookieName, affiliateCodeQueryParam, setCookieOptions);
      console.log(`Saving ref code ${affiliateCodeQueryParam} to cookies`);
    }

    const affiliateCodeCookie = getCookie(cookieName) ?? null;
    setReferralCode(affiliateCodeCookie);
    setLoaded(true);
  }, [searchParams])

  return {
    loaded,
    referralCode
  };
}