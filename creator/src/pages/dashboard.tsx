import Head from "next/head";
import { api } from "@/utils/api";
import { TLList } from "@/components/TLList/TLList";
import { ScraperList } from "@/components/Scrapper/ScraperList";

export default function Dashboard() {
  console.log("redrawing list");
  const tls = api.db.getFromDB.useQuery().data;

  return (
    <>
      <Head>
        <title>List of TLs in Version for TLSetsu</title>
      </Head>
      <div className="grid w-full grid-cols-2 text-white">
        <div>
          <TLList tls={tls} />
        </div>
        <div>
          <ScraperList />
        </div>
      </div>
    </>
  );
}
