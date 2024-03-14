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
      <div
        className="grid px-2 text-white"
        style={{
          gridTemplateColumns: "3fr 1fr",
          height: "calc( 100vh - 4rem )",
        }}
      >
        <TLList />
        <ScraperList />
      </div>
    </>
  );
}
