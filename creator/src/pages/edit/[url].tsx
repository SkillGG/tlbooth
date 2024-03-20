import { TLList } from "@/components/TLList/TLList";
import Head from "next/head";
// import { useParams } from "next/navigation";

export default function Dashboard() {
  // const params = useParams();

  return (
    <>
      <Head>
        <title>List of TLs in Version for TLSetsu</title>
      </Head>
      <div className="grid px-2 text-white">
        <TLList />
      </div>
    </>
  );
}
