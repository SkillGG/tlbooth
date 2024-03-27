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
    },
    chapters: [
      {
        info: {
          name: "DN1 Chapter 1",
          num: "1",
          url: "http://dummy.com/1/1",
        },
        lines: [
          "Dummy 1 Chapter 1 Line 1",
          "Dummy 1 Chapter 1 Line 2",
          "Dummy 1 Chapter 1 Line 3",
          "Dummy 1 Chapter 1 Line 4",
          "Dummy 1 Chapter 1 Line 5",
          "Dummy 1 Chapter 1 Line 6",
          "Dummy 1 Chapter 1 Line 7",
          "Dummy 1 Chapter 1 Line 8",
          "Dummy 1 Chapter 1 Line 9",
        ],
      },
      {
        info: {
          name: "DN1 Chapter 2",
          num: "2",
          url: "http://dummy.com/1/2",
        },
        lines: [
          "Dummy 1 Chapter 2 Line 1",
          "Dummy 1 Chapter 2 Line 2",
          "Dummy 1 Chapter 2 Line 3",
          "Dummy 1 Chapter 2 Line 4",
          "Dummy 1 Chapter 2 Line 5",
          "Dummy 1 Chapter 2 Line 6",
          "Dummy 1 Chapter 2 Line 7",
          "Dummy 1 Chapter 2 Line 8",
          "Dummy 1 Chapter 2 Line 9",
        ],
      },
      {
        info: {
          name: "DN1 Chapter 1.5",
          num: "1.5",
          url: "http://dummy.com/1/1.5",
        },
        lines: [
          "Dummy 1 Chapter 1.5 Line 1",
          "Dummy 1 Chapter 1.5 Line 2",
          "Dummy 1 Chapter 1.5 Line 3",
          "Dummy 1 Chapter 1.5 Line 4",
          "Dummy 1 Chapter 1.5 Line 5",
          "Dummy 1 Chapter 1.5 Line 6",
          "Dummy 1 Chapter 1.5 Line 7",
          "Dummy 1 Chapter 1.5 Line 8",
          "Dummy 1 Chapter 1.5 Line 9",
        ],
      },
    ],
  },
  {
    info: {
      novelName: "Dummy 2",
      novelDescription: "A second dummy novel",
      novelURL: "http://dummy.com/2",
    },
    chapters: [
      {
        info: {
          name: "DN2 Chapter 1",
          num: "1",
          url: "http://dummy.com/2/1",
        },
        lines: [
          "Dummy 2 Chapter 1 Line 1",
          "Dummy 2 Chapter 1 Line 2",
          "Dummy 2 Chapter 1 Line 3",
          "Dummy 2 Chapter 1 Line 4",
          "Dummy 2 Chapter 1 Line 5",
          "Dummy 2 Chapter 1 Line 6",
          "Dummy 2 Chapter 1 Line 7",
          "Dummy 2 Chapter 1 Line 8",
          "Dummy 2 Chapter 1 Line 9",
        ],
      },
      {
        info: {
          name: "DN1 Chapter 2",
          num: "2",
          url: "http://dummy.com/2/2",
        },
        lines: [
          "Dummy 2 Chapter 2 Line 1",
          "Dummy 2 Chapter 2 Line 2",
          "Dummy 2 Chapter 2 Line 3",
          "Dummy 2 Chapter 2 Line 4",
          "Dummy 2 Chapter 2 Line 5",
          "Dummy 2 Chapter 2 Line 6",
          "Dummy 2 Chapter 2 Line 7",
          "Dummy 2 Chapter 2 Line 8",
          "Dummy 2 Chapter 2 Line 9",
        ],
      },
      {
        info: {
          name: "DN1 Chapter 1.5",
          num: "1.5",
          url: "http://dummy.com/2/1.5",
        },
        lines: [
          "Dummy 2 Chapter 1.5 Line 1",
          "Dummy 2 Chapter 1.5 Line 2",
          "Dummy 2 Chapter 1.5 Line 3",
          "Dummy 2 Chapter 1.5 Line 4",
          "Dummy 2 Chapter 1.5 Line 5",
          "Dummy 2 Chapter 1.5 Line 6",
          "Dummy 2 Chapter 1.5 Line 7",
          "Dummy 2 Chapter 1.5 Line 8",
          "Dummy 2 Chapter 1.5 Line 9",
        ],
      },
    ],
  },
];
