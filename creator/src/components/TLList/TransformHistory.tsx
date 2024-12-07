import { useAdmin, UserType } from "@/hooks/admin";
import { useNovelStore } from "@/hooks/novelStore";
import { api } from "@/utils/api";
import React, { useEffect, useState } from "react";
import { RefreshButton } from "../Icons/refreshButton";
import { useRouter } from "next/router";
import { MutationType } from "@/hooks/mutations/mutation";

const userPermissions: Record<
  UserType,
  "all" | "none" | undefined | MutationType[]
> = {
  [UserType.PROOFREAD]: [
    MutationType.CHANGE_LINE,
    MutationType.CHANGE_LINE_STATUS,
  ],
  [UserType.ADMIN]: "all",
  [UserType.GUEST]: "none",
};

export function hasPermissionTo(
  u: UserType,
  p: MutationType,
) {
  return (
    userPermissions[u] === "all" ||
    (userPermissions[u] !== "none" &&
      userPermissions[u]?.includes(p))
  );
}

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
    saveMutations,
  } = useNovelStore();

  const { type: userType } = useAdmin();

  useEffect(() => {
    if (trans.length + undone.length === 0) {
      setShowHistory(false);
    }
  }, [trans, undone]);

  const canApply = (type: UserType) => {
    if (!type) return false;
    for (const mut of trans) {
      if (!hasPermissionTo(type, mut.type)) return false;
    }
    return true;
  };

  const router = useRouter();

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
            {canApply(userType) && (
              <RefreshButton
                title="REf??"
                className="text-center"
                refreshFn={async () => {
                  try {
                    const { storeChanges, locationChange } =
                      await apply();
                    // const goBack = sets.length > 0;

                    await invalidateList();
                    for (const storeChange of storeChanges) {
                      storeChange();
                    }
                    saveMutations(localStorage);
                    const newPath = locationChange();
                    if (newPath) void router.push(newPath);
                  } catch (e) {
                    throw e;
                  }
                }}
              >
                Apply
              </RefreshButton>
            )}
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
                gridTemplateColumns:
                  "auto auto min-content",
              }}
            >
              {trans?.map((t) => {
                return (
                  <React.Fragment key={t.id}>
                    <div
                      className="grid justify-start"
                      title={`${t.id}\nCreated @ ${t.mutationDate.toLocaleString()}`}
                    >
                      {t.type}:{" "}
                    </div>
                    <div
                      className="grid justify-center"
                      title={`${t.id}`}
                    >
                      {t.getDescription(novels ?? [])}
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
                  </React.Fragment>
                );
              })}
              {!!undone.length && (
                <>
                  <div></div>
                  <div className="grid justify-center">
                    Undone:
                  </div>
                  <div></div>
                </>
              )}
              {undone.map((t) => {
                return (
                  <React.Fragment key={`undone_${t.id}`}>
                    <div
                      className="grid justify-start"
                      title={`${t.id}`}
                    >
                      {t.type}:
                    </div>
                    <div
                      className="grid justify-center"
                      title={`${t.id}`}
                    >
                      {t.getDescription(novels ?? [])}
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
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
