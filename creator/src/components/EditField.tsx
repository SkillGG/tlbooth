import { cssDef } from "@/utils/utils";
import React, {
  type CSSProperties,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type EditFieldCustomization<T> = {
  main?: T;
  header?: {
    main?: T;
    noEdit?: T;
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
    verifyValue = () => true,
    undefinedIsEmpty = true,
  },
  ref,
) {
  const [edit, setEdit] = useState(false);

  const [prevValue, setPrevValue] = useState(defaultValue);

  const textRef = useRef<HTMLSpanElement>(null);
  const saveRef = useRef<HTMLButtonElement>(null);

  useImperativeHandle(ref, () => {
    return {
      show: () => setEdit(true),
      hide: () => setEdit(false),
    };
  });

  useEffect(() => {
    if (textRef.current)
      textRef.current.innerText = defaultValue ?? "";
  }, [defaultValue, edit]);

  return (
    <>
      <div
        className={`${cssDef(className?.main)} h-min text-sm`}
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
                  className={`${cssDef(className?.header?.noEdit)} ml-1`}
                  style={style?.header?.noEdit}
                  onClick={() => setEdit((p) => !p)}
                >
                  Edit
                </button>
                {showRestore && (
                  <button
                    className={`${cssDef(className?.header?.noEdit)} ml-1`}
                    style={style?.header?.noEdit}
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
                className={`${cssDef(className?.header?.edit?.main)} inline-grid grid-flow-col gap-x-1`}
                style={style?.header?.edit?.main}
              >
                <button
                  ref={saveRef}
                  className={`${cssDef(className?.header?.edit?.save)} text-green-300`}
                  style={style?.header?.edit?.save}
                  onClick={async () => {
                    if (textRef.current) {
                      const value =
                        textRef.current.innerText.trim() ??
                        "";
                      if (
                        value === defaultValue ||
                        (undefinedIsEmpty &&
                          !value &&
                          !defaultValue)
                      )
                        return void setEdit(false);
                      await onSave?.(value.trim());
                      setEdit(false);
                    }
                  }}
                >
                  Save
                </button>
                <button
                  className={`${cssDef(className?.header?.edit?.cancel)} text-red-400`}
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
            className={`${cssDef(className?.editField?.div)} grid grid-flow-col gap-x-2`}
            style={{
              ...style?.editField?.div,
              gridTemplateColumns: "auto min-content",
            }}
          >
            <span
              contentEditable
              className={`${className?.editField?.span} block min-w-4 border-b-2 text-center`}
              style={style?.editField?.span}
              onKeyDown={(e) => {
                if (e.code === "Enter") {
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
            ></span>
          </div>
        : <div
            key="nonEditField"
            className={`${cssDef(className?.staticField?.div)} min-h-5 text-center`}
            style={style?.staticField?.div}
          >
            <span
              className={`${cssDef(className?.staticField?.span)}`}
              style={style?.staticField?.span}
            >
              {defaultValue}
            </span>
          </div>
        }
      </div>
    </>
  );
});
