import Head from "next/head";
import { api } from "@/utils/api";
import { TLList } from "@/components/TLList/TLList";
import { ScraperList } from "@/components/Scrapper/ScraperList";
import { NovelStoreProvider } from "@/hooks/novelStore";

export default function Dashboard() {
  console.log("redrawing list");
  const tls = api.db.getFromDB.useQuery().data;

  const utils = api.useUtils();

  return (
    <>
      <Head>
        <title>List of TLs in Version for TLSetsu</title>
      </Head>
      <NovelStoreProvider
        value={tls}
        refresh={async () => {
          await utils.db.getFromDB.invalidate();
        }}
      >
        <div className="grid w-full grid-cols-2 text-white">
          <div>
            <TLList />
          </div>
          <div>
            <ScraperList />
          </div>
        </div>
      </NovelStoreProvider>
    </>
  );
}
