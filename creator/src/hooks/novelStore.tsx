import { type Novel } from "@prisma/client";
import {
  type Dispatch,
  type SetStateAction,
  type PropsWithChildren,
  createContext,
  useState,
  useContext,
} from "react";

type novelStoreType = Novel[];

type NovelStoreContext = {
  novelStore: novelStoreType;
  setNovelStore: Dispatch<SetStateAction<novelStoreType>>;
} | null;

const novelStoreContext = createContext<NovelStoreContext>(null);

export function NovelStoreProvider({ children }: PropsWithChildren) {
  const [novelStore, setNovelStore] = useState<novelStoreType>([]);

  return (
    <novelStoreContext.Provider value={{ novelStore, setNovelStore }}>
      {children}
    </novelStoreContext.Provider>
  );
}

export function useNovelStore() {
  const ctx = useContext(novelStoreContext);
  if (!ctx) throw "useNovelStore only inside NovelStoreProvider!";
  return ctx;
}
