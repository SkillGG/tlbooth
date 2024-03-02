import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const scrapperRouter = createTRPCRouter({
  getList: publicProcedure.query(({ ctx: _ }) => {
    //
  })
});
