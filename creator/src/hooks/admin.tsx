import { useAuth } from "@clerk/nextjs";
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

type UserData = { sign?: string; id: string };

const adminContext = createContext<UserData | null>(null);

export const AdminCheckProvider = ({
  children,
}: PropsWithChildren) => {
  const [admin, setAdmin] = useState<UserData | null>(null);

  const auth = useAuth();

  useEffect(() => {
    if (auth.isSignedIn) {
      if (admin?.id === auth.userId) return;
      setAdmin({ id: auth.userId });
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
