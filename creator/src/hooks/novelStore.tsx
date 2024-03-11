import type { DBNovel } from "@/server/api/routers/db";
import {
  type Dispatch,
  type SetStateAction,
  type PropsWithChildren,
  createContext,
  useState,
  useContext,
  useEffect,
} from "react";

type novelStoreType = DBNovel[] | undefined;

type NovelStoreContext = {
  novelStore: novelStoreType;
  setNovelStore: Dispatch<SetStateAction<novelStoreType>>;
  refresh: () => Promise<void>;
} | null;

const novelStoreContext = createContext<NovelStoreContext>(null);

export function NovelStoreProvider({
  children,
  value,
  refresh,
}: PropsWithChildren<{ value?: DBNovel[]; refresh: () => Promise<void> }>) {
  const [novelStore, setNovelStore] = useState<novelStoreType>(value);

  useEffect(() => {
    setNovelStore(value);
  }, [value]);

  return (
    <novelStoreContext.Provider value={{ novelStore, setNovelStore, refresh }}>
      {children}
    </novelStoreContext.Provider>
  );
}

export function useNovelStore() {
  const ctx = useContext(novelStoreContext);
  if (!ctx) throw "useNovelStore only inside NovelStoreProvider!";
  return ctx;
}
