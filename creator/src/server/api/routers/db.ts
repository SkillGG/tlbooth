import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const databaseRouter = createTRPCRouter({
  checkPass: publicProcedure.input(z.string()).mutation(({ input }) => {
    return input == process.env.EDIT_PASS;
  }),
  getFromDB: publicProcedure.query(async ({ ctx }) => {
    const x = await ctx.db.translation.findMany({ include: { lines: true } });
    return x.map((x) => {
      const nameLine = x.lines.find((f) => f.isName);
      if (!nameLine) {
        return { id: x.id, ogname: "", tlname: "" };
      }
      return { id: x.id, ogname: nameLine.OG, tlname: nameLine.TL } as const;
    });
  }),
  update: publicProcedure.mutation(async ({ ctx: { db } }) => {
    const dbResult = await db.translation.create({
      data: {
        url: "template",
        lines: {
          create: [{ OG: "Original", TL: "Translated", pos: 1, isName: false }],
        },
      },
      include: { lines: true },
    });
    console.log(dbResult);
    return dbResult;
  }),
});
