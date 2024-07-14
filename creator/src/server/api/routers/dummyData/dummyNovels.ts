import {
  type ScrapperChapter,
  type ScrapperNovel,
} from "../scrapper";

export const DummyNovels: (Omit<
  ScrapperNovel,
  "chapters"
> & {
  chapters: ScrapperChapter[];
})[] = [
  {
    info: {
      novelName: "Dummy 1",
      novelDescription: "A first dummy novel",
      novelURL: "http://dummy.com/1",
      author: "Me",
    },
    chapters: [
      {
        info: {
          name: "DN1 Chapter 1",
          ognum: 1,
          url: "http://dummy.com/1/1",
          date: new Date("02/02/2022"),
        },
        lines: [
          { pos: 0, text: "Dummy 1 Chapter 1 Line 1" },
          { pos: 1, text: "Dummy 1 Chapter 1 Line 2" },
          { pos: 2, text: "Dummy 1 Chapter 1 Line 3" },
          { pos: 3, text: "Dummy 1 Chapter 1 Line 4" },
          { pos: 4, text: "Dummy 1 Chapter 1 Line 5" },
          { pos: 5, text: "Dummy 1 Chapter 1 Line 6" },
          { pos: 6, text: "Dummy 1 Chapter 1 Line 7" },
          { pos: 7, text: "Dummy 1 Chapter 1 Line 8" },
          { pos: 8, text: "Dummy 1 Chapter 1 Line 9" },
        ],
      },
      {
        info: {
          name: "DN1 Chapter 2",
          ognum: 2,
          url: "http://dummy.com/1/2",
          date: new Date("02/02/2022"),
        },
        lines: [
          { pos: 0, text: "Dummy 1 Chapter 2 Line 1" },
          { pos: 1, text: "Dummy 1 Chapter 2 Line 1" },
          { pos: 2, text: "Dummy 1 Chapter 2 Line 2" },
          { pos: 3, text: "Dummy 1 Chapter 2 Line 3" },
          { pos: 4, text: "Dummy 1 Chapter 2 Line 4" },
          { pos: 5, text: "Dummy 1 Chapter 2 Line 5" },
          { pos: 6, text: "Dummy 1 Chapter 2 Line 6" },
          { pos: 7, text: "Dummy 1 Chapter 2 Line 7" },
          { pos: 8, text: "Dummy 1 Chapter 2 Line 8" },
          { pos: 9, text: "Dummy 1 Chapter 2 Line 9" },
        ],
      },
      {
        info: {
          name: "DN1 Chapter 1.5",
          ognum: 1.5,
          url: "http://dummy.com/1/1.5",
          date: new Date("02/02/2022"),
        },
        lines: [
          { pos: 0, text: "Dummy 1 Chapter 1.5 Line 1" },
          { pos: 1, text: "Dummy 1 Chapter 1.5 Line 2" },
          { pos: 2, text: "Dummy 1 Chapter 1.5 Line 3" },
          { pos: 3, text: "Dummy 1 Chapter 1.5 Line 4" },
          { pos: 4, text: "Dummy 1 Chapter 1.5 Line 5" },
          { pos: 5, text: "Dummy 1 Chapter 1.5 Line 6" },
          { pos: 6, text: "Dummy 1 Chapter 1.5 Line 7" },
          { pos: 7, text: "Dummy 1 Chapter 1.5 Line 8" },
          { pos: 8, text: "Dummy 1 Chapter 1.5 Line 9" },
        ],
      },
    ],
  },
  {
    info: {
      novelName: "Dummy 2",
      novelDescription: "A second dummy novel",
      novelURL: "http://dummy.com/2",
      author: "Me",
    },
    chapters: [
      {
        info: {
          name: "DN2 Chapter 1",
          ognum: 1,
          url: "http://dummy.com/2/1",
          date: new Date("02/02/2022"),
        },
        lines: [
          { pos: 0, text: "Dummy 2 Chapter 1 Line 1" },
          { pos: 1, text: "Dummy 2 Chapter 1 Line 2" },
          { pos: 2, text: "Dummy 2 Chapter 1 Line 3" },
          { pos: 3, text: "Dummy 2 Chapter 1 Line 4" },
          { pos: 4, text: "Dummy 2 Chapter 1 Line 5" },
          { pos: 5, text: "Dummy 2 Chapter 1 Line 6" },
          { pos: 6, text: "Dummy 2 Chapter 1 Line 7" },
          { pos: 7, text: "Dummy 2 Chapter 1 Line 8" },
          { pos: 8, text: "Dummy 2 Chapter 1 Line 9" },
        ],
      },
      {
        info: {
          name: "DN1 Chapter 2",
          ognum: 2,
          url: "http://dummy.com/2/2",
          date: new Date("02/02/2022"),
        },
        lines: [
          { pos: 0, text: "Dummy 2 Chapter 2 Line 1" },
          { pos: 1, text: "Dummy 2 Chapter 2 Line 2" },
          { pos: 2, text: "Dummy 2 Chapter 2 Line 3" },
          { pos: 3, text: "Dummy 2 Chapter 2 Line 4" },
          { pos: 4, text: "Dummy 2 Chapter 2 Line 5" },
          { pos: 5, text: "Dummy 2 Chapter 2 Line 6" },
          { pos: 6, text: "Dummy 2 Chapter 2 Line 7" },
          { pos: 7, text: "Dummy 2 Chapter 2 Line 8" },
          { pos: 8, text: "Dummy 2 Chapter 2 Line 9" },
        ],
      },
      {
        info: {
          name: "DN1 Chapter 1.5",
          ognum: 1.5,
          url: "http://dummy.com/2/1.5",
          date: new Date("02/02/2022"),
        },
        lines: [
          { pos: 0, text: "Dummy 2 Chapter 1.5 Line 1" },
          { pos: 1, text: "Dummy 2 Chapter 1.5 Line 2" },
          { pos: 2, text: "Dummy 2 Chapter 1.5 Line 3" },
          { pos: 3, text: "Dummy 2 Chapter 1.5 Line 4" },
          { pos: 4, text: "Dummy 2 Chapter 1.5 Line 5" },
          { pos: 5, text: "Dummy 2 Chapter 1.5 Line 6" },
          { pos: 6, text: "Dummy 2 Chapter 1.5 Line 7" },
          { pos: 7, text: "Dummy 2 Chapter 1.5 Line 8" },
          { pos: 8, text: "Dummy 2 Chapter 1.5 Line 9" },
        ],
      },
    ],
  },
];
