import { useNovelStore } from "@/hooks/novelStore";
import { EditField } from "../EditField";
import { ChangeNovelNameMutation } from "@/hooks/mutations/novelMutations/changeName";

export function NovelEditCard({
  id: novelID,
}: {
  id: string;
}) {
  const {
    getDBNovel,
    getNovel,
    removeMutation,
    mutate,
    isMutation,
  } = useNovelStore();

  const novel = getNovel(novelID);

  const localNovel = !getDBNovel(novelID);

  return (
    <div
      className={`border-2 ${localNovel ? "border-chapstate-localonly text-chapstate-localonly" : "border-chapstate-good text-chapstate-good"} w-[100%] pb-2`}
    >
      <div className="px-2">Novel:</div>
      <div className="flex w-full justify-evenly gap-3">
        <EditField
          lock={true}
          fieldName="Original name"
          defaultValue={novel?.ogname}
          className={{
            editField: { div: "text-center" },
            staticField: { div: "text-center" },
          }}
        />
        <EditField
          fieldName="Translated name"
          defaultValue={novel?.tlname}
          lock={false}
          className={{
            editField: { div: "text-center" },
            staticField: { div: "text-center" },
          }}
          onSave={(v) => {
            mutate(
              new ChangeNovelNameMutation({
                novelID,
                og: false,
                name: v,
              }),
              true,
            );
          }}
          showRestore={isMutation(
            ChangeNovelNameMutation.getID({
              novelID,
              og: false,
            }),
          )}
          onRestore={() => {
            removeMutation(
              ChangeNovelNameMutation.getID({
                novelID,
                og: false,
              }),
            );
          }}
        />
      </div>
    </div>
  );
}
