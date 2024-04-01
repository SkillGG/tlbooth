import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import reactStringReplace from "react-string-replace";

type ChapterAction = {
  label: string;
  action?(): void | Promise<void>;
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

export function WindowActionMenu({
  actions,
  hide,
  x,
  y,
}: ChapterActionMenuProps) {
  useEffect(() => {
    const abort = new AbortController();
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
      { signal: abort.signal },
    );
    return () => {
      abort.abort();
    };
  }, [hide]);

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
                    {reactStringReplace(
                      action.label,
                      /(\n)/g,
                      (_, inx) => (
                        <br
                          key={`br_${inx}_${action.label}`}
                        />
                      ),
                    )}
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
