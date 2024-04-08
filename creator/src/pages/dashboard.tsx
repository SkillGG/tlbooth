import Head from "next/head";
import { TLList } from "@/components/TLList/TLList";
import { ScraperList } from "@/components/Scrapper/ScraperList";

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>TLSetsu Dashboard</title>
      </Head>
      <div className="grid h-[unset] grid-cols-[100%] overflow-hidden px-2 text-white sm:h-[calc(_100vh_-_4rem_)] sm:grid-cols-[3fr_1fr]">
        <TLList />
        <ScraperList />
      </div>
    </>
  );
}
