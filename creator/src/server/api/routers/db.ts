import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { TL } from "@/components/Dashboard/Dashboard";

export const databaseRouter = createTRPCRouter({
    checkPass: publicProcedure.input(z.string()).mutation(({ input }) => {
        return input == process.env.EDIT_PASS
    }),
    getFromDB: publicProcedure.query(async ({ ctx }) => {
        const x = await ctx.db.translation.findMany({ include: { lines: true } });
        return x.map(x=>({id:x.id} as TL));
    }),
    update: publicProcedure.mutation(async ({ ctx: { db } }) => {
        const dbResult = await db.translation.create({
            data: {
                url: "template",
                lines: {
                    create: [{ OG: "Original", TL: "Translated", pos: 1 }]
                }
            }, include: { lines: true }
        })
        console.log(dbResult)
        return dbResult;
    })
});
