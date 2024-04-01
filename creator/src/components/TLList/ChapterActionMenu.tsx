import { useEffect } from "react";

type ChapterAction = {
  label: string;
  action?(): void | Promise<void>;
};

type ActionSeparator = "-";

export type ChapterActionMenuItem =
  | ChapterAction
  | ActionSeparator
  | undefined;

type ChapterActionMenuProps = {
  actions: ChapterActionMenuItem[];
  x: number;
  y: number;
  hide(): void;
};

export function WindowActionMenu({
  actions,
  hide,
  x,
  y,
}: ChapterActionMenuProps) {
  console.log("chapter action menu showing?");

  useEffect(() => {
    const abort = new AbortController();
    document.body.addEventListener(
      "click",
      (e) => {
        if (
          e.target &&
          e.target instanceof HTMLButtonElement &&
          !!e.target.dataset.ismenubutton
        ) {
        } else {
          hide();
        }
      },
      { signal: abort.signal },
    );
    return () => {
      abort.abort();
    };
  }, [hide]);

  return (
    <div
      className="absolute"
      style={{
        top: `${y}px`,
        left: `${x}px`,
      }}
    >
      <div
        className="flex flex-col rounded-b-lg rounded-t-lg text-black"
        style={{ transform: "translate(-100%)" }}
      >
        {actions
          .map((action, i) => {
            if (!action) return null;
            if (action === "-")
              return (
                <hr
                  key={`hr_${i}`}
                  className="h-[2px] bg-white"
                />
              );
            return (
              <div
                key={action.label}
                className="overflow-hidden bg-blue-300 first:rounded-t-lg last:rounded-b-lg"
              >
                <button
                  onClick={async () => {
                    await action.action?.();
                    hide();
                  }}
                  className="grid w-full content-center justify-center whitespace-nowrap px-1 py-[3px] hover:bg-blue-600"
                >
                  <span className="px-2">
                    {action.label}
                  </span>
                </button>
              </div>
            );
          })
          .filter((f) => f)}
      </div>
    </div>
  );
}
