import React, {
  type ComponentPropsWithoutRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  ChapterActionMenu,
  type ChapterActionMenuItem,
} from "./ChapterActionMenu";

export function ChapterMenuButton({
  actions,
  ...props
}: {
  actions: ChapterActionMenuItem[];
} & ComponentPropsWithoutRef<"div">) {
  const [showMenu, setShowMenu] = useState<
    { x: number; y: number } | false
  >(false);

  return (
    <div {...props}>
      <button
        onClick={(e) => {
          setShowMenu(() => ({
            x: e.clientX,
            y: e.clientY,
          }));
        }}
      >
        ...
      </button>
      {showMenu &&
        createPortal(
          <ChapterActionMenu
            hide={() => setShowMenu(() => false)}
            x={showMenu.x}
            y={showMenu.y}
            actions={actions}
          />,
          document.body,
        )}
    </div>
  );
}
