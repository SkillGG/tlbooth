import Head from "next/head";
import { TLList } from "@/components/TLList/TLList";
import { ScraperList } from "@/components/Scrapper/ScraperList";
import { useNovelStore } from "@/hooks/novelStore";

export default function Dashboard() {
  const { getMutations } = useNovelStore();

  console.log("Mutations", getMutations());

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
