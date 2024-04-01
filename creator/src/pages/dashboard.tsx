import Head from "next/head";
import { TLList } from "@/components/TLList/TLList";
import { ScraperList } from "@/components/Scrapper/ScraperList";
import { useMediaQuery } from "@uidotdev/usehooks";

export default function Dashboard() {
  const isSmall = useMediaQuery("(max-width: 600px)");

  return (
    <>
      <Head>
        <title>TLSetsu Dashboard</title>
      </Head>
      <div
        className="grid px-2 text-white"
        style={{
          gridTemplateColumns: isSmall ? "100%" : "3fr 1fr",
          height: isSmall ? "" : "calc( 100vh - 4rem )",
        }}
      >
        <TLList />
        <ScraperList />
      </div>
    </>
  );
}
