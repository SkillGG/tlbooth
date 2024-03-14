import { useNovelStore } from "@/hooks/novelStore";
import { api } from "@/utils/api";
import { useState } from "react";

export function TransformationHistory() {
  const [showHistory, setShowHistory] = useState(false);

  const {
    db: { invalidate: invalidateList },
  } = api.useUtils();

  const {
    novels,
    undoneMutations: undone,
    mutations: trans,
    removeMutation: remove,
    undo,
    redo,
    apply,
  } = useNovelStore();

  return (
    <>
      <div className="inline-grid w-fit grid-flow-col gap-x-3">
        {!!trans.length && (
          <button
            className="h-fit w-fit text-center"
            onClick={() => {
              const lastTF = trans[trans.length - 1];
              if (lastTF) undo(lastTF.id);
            }}
          >
            Undo
          </button>
        )}
        {undone.length > 0 && (
          <button
            className="h-fit w-fit text-center"
            onClick={() => {
              const lastTF = undone[undone.length - 1];
              if (lastTF) redo(lastTF.id);
            }}
          >
            Redo
          </button>
        )}
        {trans.length + undone.length > 0 && (
          <>
            <button
              className="h-fit w-fit text-center"
              onClick={() => setShowHistory((p) => !p)}
            >
              Show changes
            </button>
            <button
              className="text-center"
              onClick={() => {
                apply()
                  .then((sets) => {
                    void invalidateList().then((_) => {
                      for (const s of sets) {
                        s();
                      }
                    });
                  })
                  .catch(console.error);
              }}
            >
              Apply
            </button>
          </>
        )}
      </div>
      {showHistory && (
        <div
          className="absolute left-0 top-0 z-50 grid h-full w-full justify-center align-top text-white"
          style={{ backgroundColor: "#fff2" }}
          onClick={() => setShowHistory(false)}
        >
          <div
            className="mt-10 grid h-min min-h-20 min-w-20 justify-items-center border-2 border-slate-900 bg-slate-500 p-8 shadow-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            List of local changes:
            <div
              className="grid gap-x-2"
              style={{
                gridTemplateColumns: " auto auto min-content",
              }}
            >
              {trans?.map((t) => {
                return (
                  <>
                    <div className="grid justify-start" title={`${t.id}`}>
                      {t.type}:{" "}
                    </div>
                    <div className="grid justify-center" title={`${t.id}`}>
                      {t.getDesc(novels ?? [])}
                    </div>
                    <div
                      className="grid w-min justify-end text-red-800"
                      title={`${t.id}`}
                    >
                      <button
                        onClick={() => {
                          remove(t.id);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </>
                );
              })}
              {!!undone.length && (
                <>
                  <div></div>
                  <div className="grid justify-center">Undone:</div>
                  <div></div>
                </>
              )}
              {undone.map((t) => {
                return (
                  <>
                    <div className="grid justify-start" title={`${t.id}`}>
                      {t.type}:
                    </div>
                    <div className="grid justify-center" title={`${t.id}`}>
                      {t.getDesc(novels ?? [])}
                    </div>
                    <div
                      className="grid w-min grid-flow-col justify-end gap-x-1 "
                      title={`${t.id}`}
                    >
                      <button
                        className="text-green-500"
                        onClick={() => {
                          redo(t.id);
                        }}
                      >
                        Redo
                      </button>
                      <button
                        className="text-red-800"
                        onClick={() => {
                          remove(t.id);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
