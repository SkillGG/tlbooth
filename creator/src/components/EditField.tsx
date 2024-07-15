import { SanitizedText } from "@/utils/sanitizer";
import { renderToStaticMarkup } from "react-dom/server";
import React, {
  type CSSProperties,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { HTRText } from "./htrLabel";
import { useNovelStore } from "@/hooks/novelStore";
import { twMerge } from "tailwind-merge";

type EditFieldCustomization<T> = {
  main?:
    | { lock?: T; normal: T }
    | (T extends string ? T : never);
  header?: {
    main?:
      | { lock?: T; normal: T }
      | (T extends string ? T : never);
    noEdit?: {
      restore?:
        | { lock?: T; normal: T }
        | (T extends string ? T : never);
      edit?:
        | { lock?: T; normal: T }
        | (T extends string ? T : never);
    };
    edit?: {
      main?:
        | { lock?: T; normal: T }
        | (T extends string ? T : never);
      save?:
        | { lock?: T; normal: T }
        | (T extends string ? T : never);
      cancel?:
        | { lock?: T; normal: T }
        | (T extends string ? T : never);
    };
  };
  staticField?: {
    div?:
      | { lock?: T; normal: T }
      | (T extends string ? T : never);
    span?:
      | { lock?: T; normal: T }
      | (T extends string ? T : never);
  };
  editField?: {
    div?:
      | { lock?: T; normal: T }
      | (T extends string ? T : never);
    span?:
      | { lock?: T; normal: T }
      | (T extends string ? T : never);
  };
};

type EditFieldProps = {
  lock: boolean;
  fieldName: string;
  defaultValue?: string;
  onSave?: (s: string) => unknown;
  onCancel?: (s: string) => unknown;
  showRestore?: boolean;
  onRestore?: () => Promise<void> | void;
  className?: EditFieldCustomization<string>;
  style?: EditFieldCustomization<CSSProperties>;
  ref: {
    hide(): void;
    show(): void;
  } | null;
  verifyValue?: (b: string) => boolean;
  undefinedIsEmpty?: boolean;
  rawHTR?: true;
};

type EditFieldRef = { show: () => void; hide: () => void };

export const useEditRef = () => {
  return useRef<EditFieldRef>(null);
};

export const EditField = React.forwardRef<
  EditFieldRef,
  EditFieldProps
>(function EditField(
  {
    onSave,
    onCancel,
    showRestore,
    defaultValue,
    lock,
    fieldName,
    className,
    style,
    onRestore,
    rawHTR,
    verifyValue = () => true,
    undefinedIsEmpty = true,
  },
  ref,
) {
  const [edit, setEdit] = useState(false);

  const [prevValue, setPrevValue] = useState(defaultValue);

  const textRef = useRef<HTMLSpanElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  const {
    settings: { alwaysRawEdit },
  } = useNovelStore();

  useImperativeHandle(ref, () => {
    return {
      show: () => setEdit(true),
      hide: () => setEdit(false),
    };
  });

  const raw = alwaysRawEdit ? true : rawHTR;

  const getMergedDefs = (
    ...defs: (
      | { lock?: string; normal: string }
      | string
      | undefined
    )[]
  ) => {
    return twMerge(
      ...defs
        .map((d) => (typeof d === "string" ? d : d?.normal))
        .filter((f) => !!f),
      ...(lock ?
        defs
          .map((d) =>
            typeof d === "string" ? null : d?.lock ?? "",
          )
          .filter((f) => !!f)
      : []),
    );
  };

  const getMergedProps = (
    ...defs: (
      | {
          lock?: CSSProperties;
          normal: CSSProperties;
        }
      | undefined
    )[]
  ): CSSProperties => {
    return Object.assign(
      {},
      ...defs.map((p) => p?.normal).filter((f) => !!f),
      ...(lock ?
        defs.map((q) => q?.lock).filter((f) => !!f)
      : []),
    ) as CSSProperties;
  };

  return (
    <>
      <div
        className={`${getMergedDefs(className?.main)}`}
        style={getMergedProps(style?.main)}
        data-locked={lock}
      >
        <small
          className={`${getMergedDefs(className?.header?.main, className?.header?.main)}`}
          style={{
            ...style?.header?.main?.normal,
            ...(lock ? style?.header?.main?.normal : {}),
          }}
        >
          {fieldName}
          {fieldName ? ":" : ""}
          {!lock &&
            (!edit ?
              <>
                <button
                  className={twMerge(
                    `ml-1`,
                    getMergedDefs(
                      className?.header?.noEdit?.edit,
                    ),
                  )}
                  style={getMergedProps(
                    style?.header?.noEdit?.edit,
                  )}
                  onClick={() => {
                    setEdit((p) => !p);
                    setTimeout(() => {
                      textRef.current?.focus();
                    });
                  }}
                >
                  Edit
                </button>
                {showRestore && (
                  <button
                    className={twMerge(
                      `ml-1`,
                      getMergedDefs(
                        className?.header?.noEdit?.restore,
                      ),
                    )}
                    style={getMergedProps(
                      style?.header?.noEdit?.restore,
                    )}
                    onClick={() => {
                      console.log("clicking restore");
                      void onRestore?.();
                      setEdit(false);
                    }}
                  >
                    Restore
                  </button>
                )}
              </>
            : <div
                className={twMerge(
                  `inline-grid grid-flow-col gap-x-1`,
                  getMergedDefs(
                    className?.header?.edit?.main,
                  ),
                )}
                style={getMergedProps(
                  style?.header?.edit?.main,
                )}
              >
                <button
                  ref={saveRef}
                  className={twMerge(
                    `text-green-300`,
                    getMergedDefs(
                      className?.header?.edit?.save,
                    ),
                  )}
                  style={getMergedProps(
                    style?.header?.edit?.save,
                  )}
                  onClick={async () => {
                    if (textRef.current) {
                      const value =
                        textRef.current.innerHTML.trim() ??
                        "";
                      const text = SanitizedText.fromHTML(
                        value,
                        !raw,
                      ).htr;
                      if (
                        text === defaultValue ||
                        (undefinedIsEmpty &&
                          !text &&
                          !defaultValue)
                      )
                        return void setEdit(false);
                      await onSave?.(text.trim());
                      setEdit(false);
                    }
                  }}
                >
                  Save
                </button>
                <button
                  className={twMerge(
                    `text-red-400`,
                    getMergedDefs(
                      className?.header?.edit?.cancel,
                    ),
                  )}
                  style={getMergedProps(
                    style?.header?.edit?.cancel,
                  )}
                  onClick={() => {
                    setEdit((p) => !p);
                    if (textRef.current)
                      void onCancel?.(
                        textRef.current.innerText,
                      );
                  }}
                >
                  Cancel
                </button>
              </div>)}
        </small>
        {edit ?
          <div
            key="editfield"
            className={twMerge(
              ``,
              getMergedDefs(className?.editField?.div),
            )}
            style={getMergedProps(style?.editField?.div)}
          >
            <span
              contentEditable
              className={twMerge(
                `block`,
                getMergedDefs(className?.editField?.span),
              )}
              style={getMergedProps(style?.editField?.span)}
              onKeyDown={(e) => {
                if (e.code === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  saveRef.current?.click();
                }
              }}
              ref={textRef}
              onInput={() => {
                const val = textRef.current?.innerText;
                if (!val) return;
                if (!verifyValue(val)) {
                  if (textRef.current)
                    textRef.current.innerText =
                      prevValue ?? "";
                } else {
                  setPrevValue(val);
                }
              }}
              dangerouslySetInnerHTML={{
                __html:
                  raw ?
                    defaultValue ?? ""
                  : renderToStaticMarkup(
                      new SanitizedText({
                        htr: defaultValue ?? "",
                      }).toJSX(true),
                    ),
              }}
            ></span>
          </div>
        : <div
            key="nonEditField"
            className={twMerge(
              ``,
              getMergedDefs(className?.staticField?.div),
            )}
            style={getMergedProps(style?.staticField?.div)}
          >
            <div
              className={twMerge(
                ``,
                getMergedDefs(className?.staticField?.span),
              )}
              style={getMergedProps(
                style?.staticField?.span,
              )}
            >
              <HTRText htr={defaultValue ?? ""} />
            </div>
          </div>
        }
      </div>
    </>
  );
});
