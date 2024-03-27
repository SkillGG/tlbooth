import { Mutation, MutationType } from "../mutation";

type SaveData = {
  tlID: string;
  novelID: string;
  chapterID: string;
};

export const isRemoveTLSaveData = (
  o: unknown,
): o is SaveData => {
  return (
    !!o &&
    typeof o === "object" &&
    "tlID" in o &&
    typeof o.tlID === "string"
  );
};

export class RemoveTLMutation extends Mutation<
  MutationType.REMOVE_TRANSLATION,
  SaveData
> {
  static getID = (tlID: string) => `remove_tl_${tlID}`;
  constructor({ tlID, novelID, chapterID }: SaveData) {
    super(
      RemoveTLMutation.getID(tlID),
      (p) =>
        p.map((n) =>
          n.id === novelID ?
            {
              ...n,
              chapters: n.chapters.map((ch) =>
                ch.id === chapterID ?
                  {
                    ...ch,
                    translations: ch.translations.map(
                      (tl) =>
                        tl.id === tlID ?
                          { ...tl, forDeletion: true }
                        : tl,
                    ),
                  }
                : ch,
              ),
            }
          : n,
        ),
      (p): string =>
        p.find((x) => x.id === tlID)?.ogname ?? tlID,
      MutationType.REMOVE_TRANSLATION,
      async () => {
        throw "TODO";
      },
      [{ novelID }, { chapterID }],
      { tlID, novelID, chapterID },
    );
  }
  static fromData(d: SaveData) {
    return new RemoveTLMutation(d);
  }
}
