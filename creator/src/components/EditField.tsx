import { SanitizedText } from "@/utils/sanitizer";
import { cssDef } from "@/utils/utils";
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
  main?: T;
  header?: {
    main?: T;
    noEdit?: {
      restore?: T;
      edit?: T;
    };
    edit?: {
      main?: T;
      save?: T;
      cancel?: T;
    };
  };
  staticField?: {
    div?: T;
    span?: T;
  };
  editField?: {
    div?: T;
    span?: T;
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

  return (
    <>
      <div
        className={`${cssDef(className?.main)}`}
        style={style?.main}
      >
        <small
          className={`${cssDef(className?.header?.main)}`}
          style={style?.header?.main}
        >
          {fieldName}
          {fieldName ? ":" : ""}
          {!lock &&
            (!edit ?
              <>
                <button
                  className={twMerge(
                    `ml-1`,
                    cssDef(className?.header?.noEdit?.edit),
                  )}
                  style={style?.header?.noEdit?.edit}
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
                      cssDef(
                        className?.header?.noEdit?.restore,
                      ),
                    )}
                    style={style?.header?.noEdit?.restore}
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
                  cssDef(className?.header?.edit?.main),
                )}
                style={style?.header?.edit?.main}
              >
                <button
                  ref={saveRef}
                  className={twMerge(
                    `text-green-300`,
                    cssDef(className?.header?.edit?.save),
                  )}
                  style={style?.header?.edit?.save}
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
                    cssDef(className?.header?.edit?.cancel),
                  )}
                  style={style?.header?.edit?.cancel}
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
              cssDef(className?.editField?.div),
            )}
            style={{
              ...style?.editField?.div,
            }}
          >
            <span
              contentEditable
              className={twMerge(
                `block`,
                cssDef(className?.editField?.span),
              )}
              style={style?.editField?.span}
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
              cssDef(className?.staticField?.div),
            )}
            style={style?.staticField?.div}
          >
            <div
              className={twMerge(
                ``,
                cssDef(className?.staticField?.span),
              )}
              style={style?.staticField?.span}
            >
              <HTRText htr={defaultValue ?? ""} />
            </div>
          </div>
        }
      </div>
    </>
  );
});
