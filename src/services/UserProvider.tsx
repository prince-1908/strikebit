import { UserProfile, useUser as useAuth0User } from "@auth0/nextjs-auth0/client";
import { createContext, FC, PropsWithChildren, useState } from "react";
import useAsyncEffect from "use-async-effect";
import clientApiServices from "@/services/clientApiServices";
import { handleBackendErrorOptional } from "@/services/backend-errors/backendErrorHandling";
import { toast } from "react-toastify";

const isBrowser = typeof window !== "undefined";

export type UserData = {
  userDisplayName: string;
  referralCode: string;
} & UserProfile;

export interface IUserContext {
  user: UserData | null;
  initialized: boolean;
  error?: Error;
}

export const UserContext = createContext<IUserContext>({
  user: null,
  initialized: false,
});

export const UserProvider: FC<PropsWithChildren<{ isActive: boolean }>> = ({isActive, children}) => {
  const auth0User = useAuth0User();

  const [initialized, setInitialized] = useState(false);
  //const [loading, setLoading] = useState(isActive);
  const [referralCode, setReferralCode] = useState<string | null>(null);

  // fetch user data from Nodes API whenever auth0 user is updated.
  useAsyncEffect(async _ => {
    if (!isActive)
      return;

    if (auth0User.error) {
      setInitialized(true);
      return;
    }

    if (auth0User.isLoading) {
      return;
    }

    try {
      const myReferralCode = (await clientApiServices.distribrainNodesUsersApi.usersControllerGetMyReferralCode()).data;
      setReferralCode(myReferralCode!.code);
    } catch (error: any) {
      console.error(error);
      if (isBrowser) {
        let showToast = true;
        const backendError = handleBackendErrorOptional(
          error,
          {
            401: (_) => {
              showToast = false;
              return null;
            }
          }
        );

        if (showToast) {
          toast.error(backendError?.message ?? error.message);
        }
      }
    }

    setInitialized(true);
  }, [isActive, auth0User]);

  const combinedUser: UserData | null =
    (auth0User.user && referralCode) ?
      {
        ...auth0User.user,
        referralCode: referralCode,
        userDisplayName: auth0User.user.email ?? auth0User.user.name!
      } : null;

  return (
    <UserContext.Provider
      value={{
        user: combinedUser,
        initialized: initialized,
        error: auth0User.error
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
