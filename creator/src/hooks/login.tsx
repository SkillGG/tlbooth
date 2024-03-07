import { useRouter } from "next/router";
import { Dispatch, PropsWithChildren, SetStateAction, createContext, useContext, useEffect, useState } from "react";

type UserContext = {
    user: string | null
    setUser: Dispatch<SetStateAction<string | null>>
} | null

const userContext = createContext<UserContext>(null);

export function UserProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<string | null>(null);
    return <userContext.Provider value={{ user, setUser }}>{children}</userContext.Provider>
}

export function useUser() {
    const context = useContext(userContext);
    if (!context) throw "useUser only inside UserProvider!"
    return context;
}

export function useRedirect(shouldBeLoggedIn: boolean) {
    const router = useRouter();
    const { user } = useUser();
    console.log(user);
    useEffect(() => {
        if (shouldBeLoggedIn) {
            if (!user) void router.push("/");
        } else {
            if (user) void router.push("/list");
        }
    }, [user, router, shouldBeLoggedIn])
}