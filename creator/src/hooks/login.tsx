import { useRouter } from "next/router";
import {
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type UserContext = {
  user: string | null;
  setUser: Dispatch<SetStateAction<string | null>>;
  loginPage: string;
  mainPage: string;
} | null;

const userContext = createContext<UserContext>(null);

export function UserProvider({
  children,
  loginPage,
  mainPage,
}: PropsWithChildren<{ loginPage: string; mainPage: string }>) {
  const [user, setUser] = useState<string | null>(null);
  return (
    <userContext.Provider value={{ user, setUser, loginPage, mainPage }}>
      {children}
    </userContext.Provider>
  );
}

export function useUser() {
  const context = useContext(userContext);
  if (!context) throw "useUser only inside UserProvider!";
  return context;
}

export function useRedirect(shouldBeLoggedIn: boolean) {
  const router = useRouter();
  const { user, loginPage, mainPage } = useUser();
  useEffect(() => {
    if (shouldBeLoggedIn) {
      if (!user) void router.push(loginPage);
    } else {
      if (user) void router.push(mainPage);
    }
  }, [user, router, shouldBeLoggedIn, loginPage, mainPage]);
}
