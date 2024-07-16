import { cssDef } from "@/utils/utils";
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import reactStringReplace from "react-string-replace";
import { twMerge } from "tailwind-merge";

type KeyboardShortcut = {
  key: string;
  label?: string;
  ctrl?: true;
  shift?: true;
  alt?: true;
};

type ChapterAction = {
  label: string;
  className?: string;
  action?(): void | Promise<void>;
  shortcut?: KeyboardShortcut;
};

type ActionSeparator = "-";

export type ChapterActionMenuItem =
  | ChapterAction
  | ActionSeparator
  | undefined
  | false;

type ChapterActionMenuProps = {
  actions: ChapterActionMenuItem[];
  x: number;
  y: number;
  hide(): void;
};

const usePopup = () => {
  const [showMenu, setShowMenu] = useState<
    false | { x: number; y: number }
  >(false);

  const [actions, setActions] = useState<
    ChapterActionMenuItem[]
  >([]);

  return {
    props: () => {
      return {
        actions,
        hide: () => setShowMenu(false),
        x: showMenu ? showMenu.x : 0,
        y: showMenu ? showMenu.y : 0,
      };
    },
    show: (
      x: number,
      y: number,
      actions: ChapterActionMenuItem[],
    ) => {
      console.log("showing popup");
      setActions(actions);
      setShowMenu({ x, y });
    },
    hide: () => {
      setShowMenu(false);
    },
    isShown: !!showMenu,
  };
};
export type PopupMenuObject = ReturnType<typeof usePopup>;
const PopupMenu = createContext<PopupMenuObject | null>(
  null,
);

export const PopupMenuProvider = (
  props: React.PropsWithChildren,
) => {
  const popup = usePopup();

  return (
    <PopupMenu.Provider value={popup}>
      {popup.isShown &&
        createPortal(
          <WindowActionMenu {...popup.props()} />,
          document.body,
        )}
      {props.children}
    </PopupMenu.Provider>
  );
};

export const usePopupMenu = () => {
  const ctx = useContext(PopupMenu);
  if (!ctx) {
    throw "PopupMenu only usable inside PopupMenuProvider";
  }
  return ctx;
};

const shortcutToString = (s: KeyboardShortcut) => {
  return `(${s.ctrl ? "CTRL + " : ""}${s.alt ? "Alt + " : ""}${s.shift ? "Shift + " : ""}${s.label ? s.label : s.key[s.shift ? "toUpperCase" : "toLowerCase"]()})`;
};

export function WindowActionMenu({
  actions,
  hide,
  x,
  y,
}: ChapterActionMenuProps) {
  useEffect(() => {
    const clickAbort = new AbortController(); // call signal.abort() to remove listener
    document.body.addEventListener(
      "click",
      (e) => {
        if (
          !(
            e.target &&
            e.target instanceof HTMLButtonElement &&
            !!e.target.dataset.openspopup
          )
        ) {
          hide();
        }
      },
      { signal: clickAbort.signal },
    );

    const keydownAbort = new AbortController();
    document.body.addEventListener(
      "keydown",
      (e) => {
        for (const action of actions) {
          if (!action) continue;
          if (typeof action == "string") continue;
          if (!action.shortcut) continue;
          console.log(action.shortcut.key, e.code);
          if (
            e.code === action.shortcut.key &&
            !!e.ctrlKey === !!action.shortcut.ctrl &&
            !!e.shiftKey === !!action.shortcut.shift &&
            !!e.altKey == !!action.shortcut.alt
          ) {
            void action.action?.();
            hide();
          }
        }
      },
      { signal: keydownAbort.signal },
    );
    return () => {
      clickAbort.abort();
      keydownAbort.abort();
    };
  }, [hide, actions]);

  return (
    <div
      id="Popupmenu"
      className="fixed"
      style={{
        top: `${y}px`,
        left: `${x}px`,
      }}
    >
      <div
        className="flex flex-col rounded-b-lg rounded-t-lg text-black"
        style={{
          transform: `translateX(-100%) ${y > innerHeight - actions.length * 30 ? "translateY(-100%)" : ""}`,
        }}
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
                key={`${i}_${action.label}`}
                className={twMerge(
                  `overflow-hidden bg-blue-300 first:rounded-t-lg last:rounded-b-lg hover:bg-blue-600`,
                  cssDef(action.className),
                )}
              >
                <button
                  onClick={async () => {
                    await action.action?.();
                    hide();
                  }}
                  className="grid w-full content-center justify-center whitespace-nowrap px-1 py-[3px]"
                >
                  <span className="px-2">
                    {reactStringReplace(
                      action.label,
                      /(\n)/g,
                      (_, inx) => (
                        <br
                          key={`br_${inx}_${action.label}`}
                        />
                      ),
                    )}{" "}
                    {action.shortcut &&
                      shortcutToString(action.shortcut)}
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
