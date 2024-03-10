import { useParams } from "next/navigation";

export default function Edit() {
  const params = useParams();

  console.log(params);

  if (params) {
    return <>Editing url: {params.url}</>;
  } else {
    return <>No page to edit!</>;
  }
}
