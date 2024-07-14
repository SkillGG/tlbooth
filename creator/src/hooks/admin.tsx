import { useUser } from "@clerk/nextjs";
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

type UserData = {
  sign?: string;
  id: string;
  type: string;
};

const adminContext = createContext<UserData | null>(null);

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
        type: accType || "guest",
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
