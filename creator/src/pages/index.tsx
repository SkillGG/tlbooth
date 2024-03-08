import { useRedirect } from "@/hooks/login";

export default function Home() {
  useRedirect(true);
  return <></>;
}
