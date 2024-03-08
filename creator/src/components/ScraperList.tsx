import { api } from "@/utils/api";

export const ScraperList = () => {
  const novels = api.scrapper.getList.useQuery();

  return <div className="grid grid-flow-col content-center text-white"></div>;
};
