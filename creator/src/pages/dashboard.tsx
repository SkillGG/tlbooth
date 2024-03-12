import Head from "next/head";
import { TLList } from "@/components/TLList/TLList";
import { ScraperList } from "@/components/Scrapper/ScraperList";
import { api } from "@/utils/api";
import { useNovelStore } from "@/hooks/novelStore";
import { useEffect } from "react";

export default function Dashboard() {
  const novels = api.db.getFromDB.useQuery().data;
  const loadRemote = useNovelStore((s) => s.loadData);

  useEffect(() => {
    if (novels) {
      console.log("loading novels");
      loadRemote(novels);
    }
  }, [novels, loadRemote]);

  return (
    <>
      <Head>
        <title>List of TLs in Version for TLSetsu</title>
      </Head>
      <div className="grid w-full grid-cols-2 text-white">
        <div>
          <TLList />
        </div>
        <div>
          <ScraperList />
        </div>
      </div>
    </>
  );
}
