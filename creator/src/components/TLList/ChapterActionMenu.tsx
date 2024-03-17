import { useEffect, useRef, useState } from "react";

type ChapterAction = {
  label: string;
  action?(): void | Promise<void>;
};

type ActionSeparator = "-";

export type ChapterActionMenuItem =
  | ChapterAction
  | ActionSeparator;

type ChapterActionMenuProps = {
  actions: ChapterActionMenuItem[];
  x: number;
  y: number;
  hide(): void;
};

export function ChapterActionMenu({
  actions,
  hide,
  x,
  y,
}: ChapterActionMenuProps) {
  return (
    <div
      className="absolute left-0 top-0 h-full w-full bg-[#fff1]"
      onClick={() => {
        hide();
      }}
    >
      <div
        className="absolute"
        style={{
          top: `${y}px`,
          left: `${x}px`,
        }}
      >
        <div
          className="flex flex-col bg-amber-300 text-black"
          style={{ transform: "translate(-100%)" }}
        >
          {actions.map((action, i) => {
            if (action === "-")
              return <hr key={`hr_${i}`} />;
            return (
              <div key={action.label}>
                <button
                  onClick={async () => {
                    await action.action?.();
                  }}
                  className="grid content-center justify-center px-2"
                >
                  {action.label}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
