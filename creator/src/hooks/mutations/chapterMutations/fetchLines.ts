// import { type Optional } from "@/utils/utils";
// import { Mutation, MutationType } from "../mutation";
// import { TextLine } from "@prisma/client";

// type SaveData = {
//     lines: [number, string][];
//     chapterID: string;
//     novelID: string;
//     tlID: string;
//     fetchID: string;
// }

// export class FetchLinesMutation extends Mutation<MutationType.FETCH_LINES, SaveData>{
//     static fetchLineID = 0;
//     static getID({ chapterID, fetchID, novelID, tlID }: Optional<SaveData, "lines">) {
//         return `fetch_${novelID}_${chapterID}_${tlID}_${fetchID}`
//     }
//     constructor({ chapterID, novelID, tlID, lines, fetchID }: Omit<Optional<SaveData, 'fetchID'>, "lines"> & { lines: string[] }) {
//         const id = fetchID ?? `fetch_lines_${++FetchLinesMutation.fetchLineID}`;
//         super(FetchLinesMutation.getID({ chapterID, novelID, tlID, fetchID: id }), p => {
//             return p.map(n => n.id === novelID ? {
//                 ...n, chapters: n.chapters.map(ch => {
//                     return ch.id === chapterID ? {
//                         ...ch, translations: ch.translations.map(tl => {
//                             return tl.id === tlID ? {
//                                 ...tl, lines: lines.map<TextLine>((l, i) => {
//                                     return { id: `textline_${tlID}_${i}`, pos: i, ogline: l, status: "STAGED", textID: tlID, tlline: "" } satisfies TextLine;
//                                 })
//                             } : tl
//                         })
//                     } : ch
//                 })
//             } : n)
//         }, "", MutationType.FETCH_LINES, async () => { throw "TODO" }, [{ chapterID }, { novelID }, { tlID }], { chapterID, novelID, fetchID: id, lines: lines.map((n, i) => [i, n]), tlID });
//     }
// }