import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const novel1 = await prisma.novel.upsert({
    where: { url: "https://testnovel.com/1" },
    update: {},
    create: {
      ogname: "テスト小説 1",
      url: "https://testnovel.com/1",
      chapters: {
        create: [
          {
            url: "https://testnovel.com/1/1",
            ogname: "テスト章 1 Staged",
            num: "1",
            tlname: "Test chapter 1 Staged",
            translations: {
              create: {
                status: "STAGED",
                oglang: "JP",
                tllang: "EN",
                lines: {
                  create: [
                    {
                      ogline: "１行：名前は？",
                      tlline: "Line 1: Name?",
                      pos: 1,
                    },
                    {
                      ogline: "２行：死んでくれ！",
                      tlline: "Line 2: Die!",
                      pos: 2,
                    },
                  ],
                },
              },
            },
          },
          {
            num: "2",
            url: "https://testnovel.com/1/2",
            ogname: "テスト章 2 PR",
            tlname: "Test chapter 2 PR",
            translations: {
              create: [
                {
                  status: "PR",
                  oglang: "JP",
                  tllang: "EN",
                  lines: {
                    create: [
                      {
                        ogline: "１行：名前は？",
                        tlline: "Line 1: Name?",
                        pos: 1,
                        status: "PR",
                      },
                      {
                        ogline: "２行：死んでくれ！",
                        tlline: "Line 2: Die!",
                        pos: 2,
                        status: "PR",
                      },
                    ],
                  },
                },
                {
                  status: "PR",
                  oglang: "JP",
                  tllang: "PL",
                  lines: {
                    create: [
                      {
                        ogline: "１行：名前は？",
                        tlline: "Line 1: Name?",
                        pos: 1,
                        status: "PR",
                      },
                      {
                        ogline: "２行：死んでくれ！",
                        tlline: "Line 2: Die!",
                        pos: 2,
                        status: "TL",
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            url: "https://testnovel.com/1/3",
            ogname: "テスト章 3 TLd",
            num: "3",
            tlname: "Test chapter 3 TLd",
            translations: {
              create: [
                {
                  status: "PUBLISH",
                  oglang: "JP",
                  tllang: "EN",
                  lines: {
                    create: [
                      {
                        ogline: "OG 1",
                        tlline: "TL 1",
                        pos: 0,
                        status: "TL",
                      },
                      {
                        ogline: "OG 1",
                        tlline: "TL 1",
                        pos: 0,
                        status: "TL",
                      },
                    ],
                  },
                },
                {
                  status: "PR",
                  oglang: "JP",
                  tllang: "EN",
                  lines: {
                    create: [
                      {
                        ogline: "OG 2",
                        tlline: "TL 2",
                        pos: 0,
                        status: "TL",
                      },
                      {
                        ogline: "OG 2",
                        tlline: "TL 2",
                        pos: 0,
                      },
                    ],
                  },
                },
                {
                  status: "TL",
                  oglang: "JP",
                  tllang: "EN",
                  lines: {
                    create: [
                      {
                        ogline: "OG 3",
                        tlline: "TL 3",
                        pos: 0,
                      },
                    ],
                  },
                },
              ],
            },
          },
          {
            url: "https://testnovel.com/1/4",
            ogname: "テスト章 4 PUBed",
            tlname: "Test chapter 4 PUBed",
            num: "4",
            translations: {
              create: [
                {
                  status: "TL",
                  oglang: "JP",
                  tllang: "EN",
                  lines: {
                    create: [
                      {
                        ogline: "OG l1",
                        tlline: "TL l1",
                        pos: 0,
                        status: "PR",
                      },
                    ],
                  },
                },
                {
                  status: "TL",
                  oglang: "JP",
                  tllang: "PL",
                  lines: {
                    create: [
                      {
                        ogline: "OG l2",
                        tlline: "TL l2",
                        pos: 1,
                        status: "PR",
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  });
  console.log({ novel1 });
}

void main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
