import { useUser } from "@clerk/nextjs";
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

export enum UserType {
  PROOFREAD = "proofread",
  ADMIN = "admin",
  GUEST = "guest",
}

type UserData = {
  sign?: string;
  id: string;
  type: UserType;
};

const adminContext = createContext<UserData | null>(null);

export const isUserType = (
  c: string | false,
): c is UserType => {
  if (!c) return false;
  return (
    Object.values(UserType) as readonly string[]
  ).includes(c);
};

export const AdminCheckProvider = ({
  children,
}: PropsWithChildren) => {
  const [admin, setAdmin] = useState<UserData | null>(null);

  const auth = useUser();

  useEffect(() => {
    if (auth.isSignedIn) {
      if (admin?.id === auth.user.id) return;
      const accType =
        "type" in auth.user.publicMetadata &&
        typeof auth.user.publicMetadata.type === "string" &&
        auth.user.publicMetadata.type;
      setAdmin({
        id: auth.user.id,
        type:
          isUserType(accType) ? accType : UserType.GUEST,
      });
    }
  }, [auth, admin]);

  return (
    <adminContext.Provider value={admin}>
      {children}
    </adminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(adminContext);
  if (ctx === null)
    throw "useAdmin only inside AdminCheckProvider";
  return ctx;
};
