import { useContext } from "react";
import { UserContext } from "@/services/UserProvider";

export const useUser = () => useContext(UserContext);
