import { api } from "@/utils/api";
import { createContext, useState } from "react";

export type TL = {
  id: string;
  ogname:string;
  tlname:string;
};

const TLStore = createContext<TL[]>([]);

type DashboardState =
  | { type: "list" }
  | { type: "edit"; tl: TL }
  | { type: "create"; url: string };

export function Dashboard() {
  const tls = api.db.getFromDB.useQuery().data ?? [];
  const [state, setState] = useState<DashboardState>({ type: "list" });

  return (
    <>
      <nav></nav> 
      <main>
        <TLStore.Provider value={tls}>
          {state.type === "list" && (
            <div className="border-black">
              <h2>Current translations</h2>
              {tls.map((tl) => {
                return <div key={tl.ogname}>{tl.tlname}/{tl.ogname}</div>;
              })}
            </div>
          )}
        </TLStore.Provider>
      </main>
    </>
  );
}
